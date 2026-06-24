import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { NutritionGoalService } from '../../../domain/services/nutrition-goal.service';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly nutritionGoalService: NutritionGoalService,
  ) {}

  async execute(userId: string, updateDto: any) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const merged = {
      age: updateDto.age ?? user.age,
      gender: updateDto.gender ?? user.gender,
      height: updateDto.height ?? user.height,
      weight: updateDto.weight ?? user.weight,
      activityLevel: updateDto.activityLevel ?? user.activityLevel,
    };

    let goalsUpdate = {};
    if (
      merged.age &&
      merged.gender &&
      merged.height &&
      merged.weight &&
      merged.activityLevel
    ) {
      goalsUpdate = this.nutritionGoalService.calculateAllNutritionGoals(
        merged.weight,
        merged.height,
        merged.age,
        merged.gender,
        merged.activityLevel as any,
      );
    }

    const updatedUser = await this.userRepository.update(userId, {
      ...updateDto,
      ...goalsUpdate,
    });

    return updatedUser;
  }
}
