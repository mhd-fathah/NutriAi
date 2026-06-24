import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IMealRepository } from '../../../domain/repositories/meal.repository.interface';
import type { IFoodAnalysisProvider } from '../../../domain/providers/food-analysis-provider.interface';
import { CloudinaryService } from '../../../infrastructure/services/cloudinary.service';
import { InMemoryCacheService } from '../../../infrastructure/database/mongodb/repositories/cache.service';
import { NutritionFallbackService } from '../../../infrastructure/services/nutrition-fallback.service';
import * as crypto from 'crypto';

@Injectable()
export class UploadMealUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IMealRepository')
    private readonly mealRepository: IMealRepository,
    @Inject('IFoodAnalysisProvider')
    private readonly foodAnalysisProvider: IFoodAnalysisProvider,
    private readonly cloudinaryService: CloudinaryService,
    private readonly cacheService: InMemoryCacheService,
    private readonly fallbackService: NutritionFallbackService,
  ) {}

  async execute(
    userId: string,
    data: {
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
      imageBase64: string;
      mimeType?: string;
    },
  ) {
    const { mealType, imageBase64, mimeType = 'image/jpeg' } = data;

    // 1. Check user context
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // 1.5. Enforce Rate Limiting (20 requests per day per user)
    const rateLimitKey = `rate_limit_${userId}`;
    const now = Date.now();
    const rateLimitData = this.cacheService.get<{ count: number; lastReset: number }>(rateLimitKey) || { count: 0, lastReset: now };

    if (now - rateLimitData.lastReset > 24 * 60 * 60 * 1000) {
      rateLimitData.count = 0;
      rateLimitData.lastReset = now;
    }

    if (rateLimitData.count >= 20) {
      throw new BadRequestException('Daily AI analysis limit reached.');
    }

    // 1.8. Check Image Hash Cache
    const imageHash = crypto.createHash('sha256').update(imageBase64).digest('hex');
    const cacheStartTime = Date.now();
    const cachedMeal = await this.mealRepository.findByImageHash(imageHash);

    if (cachedMeal && !cachedMeal.isEstimated) {
      const cacheDuration = Date.now() - cacheStartTime;
      console.log(`[AI CACHE] Cache Hit | Hash: ${imageHash} | Duration: ${cacheDuration}ms`);
      
      // Invalidate user dashboard cache so that the new meal displays immediately
      this.cacheService.delete(`dashboard_${userId}`);
      
      // Save duplicate meal using cached values
      const duplicateMeal = await this.mealRepository.create({
        userId,
        mealType,
        imageUrl: cachedMeal.imageUrl,
        foodName: cachedMeal.foodName,
        estimatedWeight: cachedMeal.estimatedWeight,
        calories: cachedMeal.calories,
        protein: cachedMeal.protein,
        carbs: cachedMeal.carbs,
        fat: cachedMeal.fat,
        sugar: cachedMeal.sugar,
        fiber: cachedMeal.fiber,
        sodium: cachedMeal.sodium,
        foods: cachedMeal.foods,
        confidence: cachedMeal.confidence,
        analysisVersion: '2.0',
        aiTips: cachedMeal.aiTips,
        isEstimated: cachedMeal.isEstimated,
        aiStatus: cachedMeal.aiStatus,
        aiProvider: cachedMeal.aiProvider,
        imageHash: imageHash,
      });

      return duplicateMeal;
    }

    console.log(`[AI CACHE] Cache Miss | Calling Gemini`);

    // 2. Run AI Food Recognition with Rule-Based Fallback
    let nutrition: any;
    let fallbackUsed = false;
    const geminiStartTime = Date.now();
    try {
      nutrition = await this.foodAnalysisProvider.analyzeFood(imageBase64, mimeType);
      const geminiDuration = Date.now() - geminiStartTime;
      console.log(`[GEMINI] Duration: ${(geminiDuration / 1000).toFixed(1)}s`);
      
      if (nutrition.aiStatus === 'fallback') {
        fallbackUsed = true;
      }
    } catch (err) {
      console.error('Gemini Provider Exception:', err);
      fallbackUsed = true;
    }

    // If Gemini fails, call Rule-Based Fallback
    if (fallbackUsed) {
      console.log(`[FALLBACK] Provider: RuleBased`);
      nutrition = this.fallbackService.estimateNutrition(mealType, 'Unknown Food');
    }

    // 3. Upload to Cloudinary
    let imageUrl = '';
    try {
      const uploadResult = await this.cloudinaryService.uploadImage(
        imageBase64,
        mimeType,
      );
      imageUrl = uploadResult.url;
    } catch (cloudinaryError) {
      imageUrl = `data:${mimeType};base64,${imageBase64}`;
    }

    // 4. Fetch today's meals to calculate daily totals for tips
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayMeals = await this.mealRepository.findByUserIdAndDateRange(
      userId,
      startOfDay,
      endOfDay,
    );

    const consumed = todayMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
        sugar: acc.sugar + (m.sugar || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
    );

    const totalCalories = consumed.calories + nutrition.calories;
    const totalProtein = consumed.protein + nutrition.protein;
    const totalCarbs = consumed.carbs + nutrition.carbs;
    const totalFat = consumed.fat + nutrition.fat;
    const totalSugar = consumed.sugar + (nutrition.sugar || 0);

    // 5. Generate Coaching Tips (Only call Gemini if not using fallback nutrition)
    let tips: string[] = [];
    if (!fallbackUsed) {
      try {
        tips = await this.foodAnalysisProvider.generateNutritionTips({
          user: {
            age: user.age,
            gender: user.gender,
            weight: user.weight,
            height: user.height,
            goal: user.goal || 'maintain_weight',
            dailyCalories: user.dailyCalories || 2000,
            dailyProtein: user.dailyProtein || 150,
            dailyCarbs: user.dailyCarbs || 250,
            dailyFat: user.dailyFat || 70,
          },
          todayConsumption: {
            calories: totalCalories,
            protein: totalProtein,
            carbs: totalCarbs,
            fat: totalFat,
            sugar: totalSugar,
          },
          mealHistory: [
            ...todayMeals.map((m) => ({
              mealType: m.mealType,
              foodName: m.foodName,
              calories: m.calories,
              protein: m.protein,
              carbs: m.carbs,
              fat: m.fat,
            })),
            {
              mealType,
              foodName: nutrition.foodName,
              calories: nutrition.calories,
              protein: nutrition.protein,
              carbs: nutrition.carbs,
              fat: nutrition.fat,
            },
          ],
        });
      } catch (tipsErr) {
        console.error('Coaching tips generation failed:', tipsErr);
      }
    }

    if (tips.length === 0) {
      tips = [
        'Stay consistent on your goals and keep tracking your meals.',
        'Aim to drink at least 8 glasses of water today.',
      ];
    }

    const mealData = {
      userId,
      mealType,
      imageUrl,
      foodName: nutrition.foodName,
      estimatedWeight: nutrition.estimatedWeight,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      sugar: nutrition.sugar,
      fiber: nutrition.fiber,
      sodium: nutrition.sodium,
      foods: nutrition.foods,
      confidence: nutrition.confidence,
      analysisVersion: '2.0',
      aiTips: tips,
      isEstimated: nutrition.isEstimated,
      aiStatus: nutrition.aiStatus,
      aiProvider: nutrition.aiProvider,
      imageHash,
    };
    console.log("MEAL_TO_SAVE", mealData);

    // 6. Save meal to database
    const meal = await this.mealRepository.create(mealData);
    console.log("SAVED_MEAL", meal);

    // Increment rate limit count on successful new analysis
    rateLimitData.count += 1;
    this.cacheService.set(rateLimitKey, rateLimitData);

    console.log("ACTION_RETURN", meal);
    return meal;
  }
}
