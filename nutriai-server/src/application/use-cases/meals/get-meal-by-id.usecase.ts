import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IMealRepository } from '../../../domain/repositories/meal.repository.interface';

@Injectable()
export class GetMealByIdUseCase {
  constructor(
    @Inject('IMealRepository')
    private readonly mealRepository: IMealRepository,
  ) {}

  async execute(id: string) {
    const meal = await this.mealRepository.findById(id);
    if (!meal) {
      throw new NotFoundException('Meal not found');
    }
    return meal;
  }
}
