import { Injectable, Inject } from '@nestjs/common';
import type { IMealRepository } from '../../../domain/repositories/meal.repository.interface';

@Injectable()
export class GetMealsPaginatedUseCase {
  constructor(
    @Inject('IMealRepository')
    private readonly mealRepository: IMealRepository,
  ) {}

  async execute(userId: string, limit: number = 10, page: number = 1) {
    const skip = (page - 1) * limit;
    return this.mealRepository.findByUserIdPaginated(userId, limit, skip);
  }
}
