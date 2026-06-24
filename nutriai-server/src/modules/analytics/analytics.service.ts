import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import type { IMealRepository } from '../meals/repositories/meal.repository.interface';
import type { IUserRepository } from '../users/repositories/user.repository.interface';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('IMealRepository')
    private readonly mealRepository: IMealRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async getDashboardData(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Fetch today's meals
    const todayMeals = await this.mealRepository.findByUserIdAndDateRange(
      userId,
      startOfDay,
      endOfDay,
    );

    // 2. Today's nutrition totals
    const todayNutrition = todayMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
        sugar: acc.sugar + m.sugar,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
    );

    // 3. Weekly data (last 7 days)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weeklyMeals = await this.mealRepository.findByUserIdAndDateRange(
      userId,
      weekStart,
      new Date(),
    );

    const weeklyMap = new Map<string, any>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      weeklyMap.set(key, {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
    }

    weeklyMeals.forEach((m) => {
      const key = m.createdAt.toISOString().split('T')[0];
      const existing = weeklyMap.get(key);
      if (existing) {
        existing.calories += m.calories;
        existing.protein += m.protein;
        existing.carbs += m.carbs;
        existing.fat += m.fat;
      }
    });

    const weeklyData = Array.from(weeklyMap.values());

    // 4. Calculate Streak
    // Fetch all meals of the user sorted by date descending
    const allMeals = await this.mealRepository.findByUserIdAndDateRange(
      userId,
      new Date(0), // All time
      new Date(),
    );

    let streak = 0;
    if (allMeals.length > 0) {
      const mealDates = allMeals.map((m) => {
        const d = new Date(m.createdAt);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      });
      const uniqueSortedDates = Array.from(new Set(mealDates)).sort(
        (a, b) => b - a,
      );

      const today = new Date();
      const todayTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ).getTime();
      const yesterdayTime = todayTime - 24 * 60 * 60 * 1000;

      if (
        uniqueSortedDates[0] === todayTime ||
        uniqueSortedDates[0] === yesterdayTime
      ) {
        streak = 1;
        for (let i = 0; i < uniqueSortedDates.length - 1; i++) {
          if (
            uniqueSortedDates[i] - uniqueSortedDates[i + 1] ===
            24 * 60 * 60 * 1000
          ) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // 5. Latest coaching tips from the most recent meal
    const latestTips = todayMeals[0]?.aiTips || [];

    const userProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      activityLevel: user.activityLevel,
      bmi: user.bmi,
      goal: user.goal,
      dailyCalories: user.dailyCalories,
      dailyProtein: user.dailyProtein,
      dailyCarbs: user.dailyCarbs,
      dailyFat: user.dailyFat,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
    };

    return {
      user: userProfile,
      todayMeals,
      todayNutrition,
      weeklyData,
      latestTips,
      streak,
    };
  }
}
