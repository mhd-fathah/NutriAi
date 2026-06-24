import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IMealRepository } from '../../../domain/repositories/meal.repository.interface';
import type { IAnalyticsRepository } from '../../../domain/repositories/analytics.repository.interface';

@Injectable()
export class GetDashboardUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IMealRepository')
    private readonly mealRepository: IMealRepository,
    @Inject('IAnalyticsRepository')
    private readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
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

    // 2. Today's nutrition totals via aggregation pipeline
    const todayNutrition = await this.analyticsRepository.getNutritionTotalsForRange(
      userId,
      startOfDay,
      endOfDay,
    );

    // 3. Weekly data (last 7 days) via aggregation pipeline
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weeklyStats = await this.analyticsRepository.getDailyStatsForRange(
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

    weeklyStats.forEach((stat) => {
      const existing = weeklyMap.get(stat.date);
      if (existing) {
        existing.calories = stat.calories;
        existing.protein = stat.protein;
        existing.carbs = stat.carbs;
        existing.fat = stat.fat;
      }
    });

    const weeklyData = Array.from(weeklyMap.values());

    // 4. Calculate Streak using meal dates
    const mealDates = await this.analyticsRepository.getMealDatesDescending(userId);

    let streak = 0;
    if (mealDates.length > 0) {
      const dayTimes = mealDates.map((d) => {
        const dateObj = new Date(d);
        return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
      });
      const uniqueSortedDates = Array.from(new Set(dayTimes)).sort(
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
      id: user.id,
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
