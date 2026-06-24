import { Injectable, Inject } from '@nestjs/common';
import type { IMealRepository } from '../../../domain/repositories/meal.repository.interface';

@Injectable()
export class GetMealHistoryUseCase {
  constructor(
    @Inject('IMealRepository')
    private readonly mealRepository: IMealRepository,
  ) {}

  async execute(userId: string, range: 'daily' | 'weekly' | 'monthly') {
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
      meals.map((m) => m.createdAt?.toISOString().split('T')[0]),
    ).size;
    summary.avgCalories = uniqueDays > 0 ? summary.totalCalories / uniqueDays : 0;

    return {
      meals,
      summary,
    };
  }
}
