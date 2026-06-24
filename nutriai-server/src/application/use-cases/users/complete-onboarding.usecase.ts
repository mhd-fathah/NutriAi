import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { NutritionGoalService } from '../../../domain/services/nutrition-goal.service';

@Injectable()
export class CompleteOnboardingUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly nutritionGoalService: NutritionGoalService,
  ) {}

  async execute(
    userId: string,
    data: {
      age: number;
      gender: 'male' | 'female';
      height: number;
      weight: number;
      activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
    },
  ) {
    const { age, gender, height, weight, activityLevel } = data;

    const goals = this.nutritionGoalService.calculateAllNutritionGoals(
      weight,
      height,
      age,
      gender,
      activityLevel,
    );

    const user = await this.userRepository.update(userId, {
      age,
      gender,
      height,
      weight,
      activityLevel,
      bmi: goals.bmi,
      goal: goals.goal,
      dailyCalories: goals.dailyCalories,
      dailyProtein: goals.dailyProtein,
      dailyCarbs: goals.dailyCarbs,
      dailyFat: goals.dailyFat,
      onboardingCompleted: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
