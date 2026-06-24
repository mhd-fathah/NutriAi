import { Injectable, Inject } from '@nestjs/common';
import type { IMealRepository } from '../../../domain/repositories/meal.repository.interface';
import { InMemoryCacheService } from '../../../infrastructure/database/mongodb/repositories/cache.service';
import { SaveMealDto } from '../../../common/dto/meals.dto';

@Injectable()
export class SaveMealUseCase {
  constructor(
    @Inject('IMealRepository')
    private readonly mealRepository: IMealRepository,
    private readonly cacheService: InMemoryCacheService,
  ) {}

  async execute(userId: string, saveMealDto: SaveMealDto) {
    const mealData = {
      ...saveMealDto,
      userId,
      analysisVersion: '2.0',
    };

    console.log('SAVING_CONFIRMED_MEAL', mealData);

    const meal = await this.mealRepository.create(mealData);

    console.log('SAVED_CONFIRMED_MEAL', meal);

    // Invalidate user dashboard cache so that the new meal displays immediately
    this.cacheService.delete(`dashboard_${userId}`);

    return meal;
  }
}
