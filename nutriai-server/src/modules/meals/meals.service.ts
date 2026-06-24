import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import type { IMealRepository } from './repositories/meal.repository.interface';
import type { IUserRepository } from '../users/repositories/user.repository.interface';
import { GeminiService } from '../gemini/gemini.service';
import { CloudinaryService } from './cloudinary.service';
import { CreateMealDto } from '../../common/dto/meals.dto';

@Injectable()
export class MealsService {
  constructor(
    @Inject('IMealRepository')
    private readonly mealRepository: IMealRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly geminiService: GeminiService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createMeal(userId: string, createMealDto: CreateMealDto) {
    const { mealType, imageBase64, mimeType = 'image/jpeg' } = createMealDto;

    // 1. Check user context
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // 2. Run AI Food Recognition
    const nutrition = await this.geminiService.analyzeFood(imageBase64, mimeType);

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
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const totalCalories = consumed.calories + nutrition.calories;
    const totalProtein = consumed.protein + nutrition.protein;
    const totalCarbs = consumed.carbs + nutrition.carbs;
    const totalFat = consumed.fat + nutrition.fat;

    // 5. Generate Coaching Tips
    const tips = await this.geminiService.generateNutritionTips({
      goal: user.goal || 'maintain_weight',
      dailyCalories: user.dailyCalories || 2000,
      consumedCalories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    });

    // 6. Save meal to database
    const meal = await this.mealRepository.create({
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
      aiTips: tips,
      isEstimated: nutrition.isEstimated,
      aiStatus: nutrition.aiStatus,
      aiProvider: nutrition.aiProvider,
    });

    return meal;
  }

  async getMealById(id: string) {
    const meal = await this.mealRepository.findById(id);
    if (!meal) {
      throw new BadRequestException('Meal not found');
    }
    return meal;
  }

  async getMealsHistory(userId: string, range: 'daily' | 'weekly' | 'monthly') {
    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (range === 'weekly') {
      startDate.setDate(now.getDate() - 6);
    } else if (range === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
    }

    const meals = await this.mealRepository.findByUserIdAndDateRange(
      userId,
      startDate,
      now,
    );

    const summary = meals.reduce(
      (acc, m) => {
        acc.totalCalories += m.calories;
        acc.totalProtein += m.protein;
        acc.totalCarbs += m.carbs;
        acc.totalFat += m.fat;
        return acc;
      },
      {
        totalCalories: 0,
        avgCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      },
    );

    const uniqueDays = new Set(
      meals.map((m) => m.createdAt.toISOString().split('T')[0]),
    ).size;
    summary.avgCalories = uniqueDays > 0 ? summary.totalCalories / uniqueDays : 0;

    return {
      meals,
      summary,
    };
  }

  async getMealsPaginated(userId: string, limit: number = 10, page: number = 1) {
    const skip = (page - 1) * limit;
    return this.mealRepository.findByUserIdPaginated(userId, limit, skip);
  }
}
