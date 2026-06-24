import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meal, MealDocument } from '../schemas/meal.schema';
import { IMealRepository } from './meal.repository.interface';

@Injectable()
export class MealRepository implements IMealRepository {
  constructor(
    @InjectModel(Meal.name) private readonly mealModel: Model<MealDocument>,
  ) {}

  async findById(id: string): Promise<MealDocument | null> {
    return this.mealModel.findById(id).exec();
  }

  async create(createMealDto: any): Promise<MealDocument> {
    const newMeal = new this.mealModel(createMealDto);
    return newMeal.save();
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MealDocument[]> {
    return this.mealModel
      .find({
        userId,
        createdAt: { $gte: startDate, $lt: endDate },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUserIdPaginated(
    userId: string,
    limit: number,
    skip: number,
  ): Promise<{ meals: MealDocument[]; total: number }> {
    const [meals, total] = await Promise.all([
      this.mealModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.mealModel.countDocuments({ userId }).exec(),
    ]);

    return { meals, total };
  }

  async deleteById(id: string): Promise<MealDocument | null> {
    return this.mealModel.findByIdAndDelete(id).exec();
  }
}
