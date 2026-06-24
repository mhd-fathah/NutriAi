import { MealEntity } from '../entities/meal.entity';

export interface IMealRepository {
  findById(id: string): Promise<MealEntity | null>;
  create(meal: Partial<MealEntity>): Promise<MealEntity>;
  findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MealEntity[]>;
  findByUserIdPaginated(
    userId: string,
    limit: number,
    skip: number,
  ): Promise<{ meals: MealEntity[]; total: number }>;
  deleteById(id: string): Promise<MealEntity | null>;
}
