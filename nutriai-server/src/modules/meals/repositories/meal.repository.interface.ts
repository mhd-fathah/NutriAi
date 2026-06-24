import { MealDocument } from '../schemas/meal.schema';

export interface IMealRepository {
  findById(id: string): Promise<MealDocument | null>;
  create(createMealDto: any): Promise<MealDocument>;
  findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MealDocument[]>;
  findByUserIdPaginated(
    userId: string,
    limit: number,
    skip: number,
  ): Promise<{ meals: MealDocument[]; total: number }>;
  deleteById(id: string): Promise<MealDocument | null>;
}
