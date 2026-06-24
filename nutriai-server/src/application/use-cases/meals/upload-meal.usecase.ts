import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IMealRepository } from '../../../domain/repositories/meal.repository.interface';
import type { IFoodAnalysisProvider } from '../../../domain/providers/food-analysis-provider.interface';
import { CloudinaryService } from '../../../infrastructure/services/cloudinary.service';

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

    // 2. Run AI Food Recognition
    const nutrition = await this.foodAnalysisProvider.analyzeFood(imageBase64, mimeType);

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

    // 5. Generate Coaching Tips
    const tips = await this.foodAnalysisProvider.generateNutritionTips({
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
    };
    console.log("MEAL_TO_SAVE", mealData);

    // 6. Save meal to database
    const meal = await this.mealRepository.create(mealData);
    console.log("SAVED_MEAL", meal);

    console.log("ACTION_RETURN", meal);
    return meal;
  }
}
