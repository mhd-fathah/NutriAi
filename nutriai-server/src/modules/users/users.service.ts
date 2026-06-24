import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import type { IUserRepository } from './repositories/user.repository.interface';
import { OnboardingDto, UpdateProfileDto } from '../../common/dto/users.dto';

const ACTIVITY_LEVELS = {
  sedentary: { multiplier: 1.2 },
  lightly_active: { multiplier: 1.375 },
  moderately_active: { multiplier: 1.55 },
  very_active: { multiplier: 1.725 },
  extra_active: { multiplier: 1.9 },
};

const MACRO_SPLITS = {
  protein: 0.3,
  carbs: 0.4,
  fat: 0.3,
};

const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  private calculateAllNutritionGoals(
    weight: number,
    height: number,
    age: number,
    gender: 'male' | 'female',
    activityLevel: keyof typeof ACTIVITY_LEVELS,
  ) {
    // 1. BMI
    const heightInMeters = height / 100;
    const bmi = Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;

    // 2. Goal Recommendation
    let goal: 'gain_weight' | 'maintain_weight' | 'lose_weight' = 'maintain_weight';
    if (bmi < 18.5) goal = 'gain_weight';
    else if (bmi > 24.9) goal = 'lose_weight';

    // 3. BMR (Mifflin-St Jeor)
    const base = 10 * weight + 6.25 * height - 5 * age;
    const bmr = gender === 'male' ? base + 5 : base - 161;

    // 4. Daily Calories
    const multiplier = ACTIVITY_LEVELS[activityLevel].multiplier;
    const dailyCalories = Math.round(bmr * multiplier);

    // 5. Macros
    const dailyProtein = Math.round(
      (dailyCalories * MACRO_SPLITS.protein) / CALORIES_PER_GRAM.protein,
    );
    const dailyCarbs = Math.round(
      (dailyCalories * MACRO_SPLITS.carbs) / CALORIES_PER_GRAM.carbs,
    );
    const dailyFat = Math.round(
      (dailyCalories * MACRO_SPLITS.fat) / CALORIES_PER_GRAM.fat,
    );

    return {
      bmi,
      goal,
      dailyCalories,
      dailyProtein,
      dailyCarbs,
      dailyFat,
    };
  }

  async completeOnboarding(userId: string, onboardingDto: OnboardingDto) {
    const { age, gender, height, weight, activityLevel } = onboardingDto;

    const goals = this.calculateAllNutritionGoals(
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
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const merged = {
      age: updateProfileDto.age ?? user.age,
      gender: updateProfileDto.gender ?? user.gender,
      height: updateProfileDto.height ?? user.height,
      weight: updateProfileDto.weight ?? user.weight,
      activityLevel: updateProfileDto.activityLevel ?? user.activityLevel,
    };

    let goalsUpdate = {};
    if (
      merged.age &&
      merged.gender &&
      merged.height &&
      merged.weight &&
      merged.activityLevel
    ) {
      goalsUpdate = this.calculateAllNutritionGoals(
        merged.weight,
        merged.height,
        merged.age,
        merged.gender,
        merged.activityLevel as any,
      );
    }

    const updatedUser = await this.userRepository.update(userId, {
      ...updateProfileDto,
      ...goalsUpdate,
    });

    return updatedUser;
  }
}
