import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meal, MealDocument } from '../schemas/meal.schema';
import { IMealRepository } from '../../../../domain/repositories/meal.repository.interface';
import { MealEntity } from '../../../../domain/entities/meal.entity';

@Injectable()
export class MongoMealRepository implements IMealRepository {
  constructor(
    @InjectModel(Meal.name) private readonly mealModel: Model<MealDocument>,
  ) {}

  private mapToEntity(doc: MealDocument | null): MealEntity | null {
    if (!doc) return null;
    return new MealEntity({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      mealType: doc.mealType,
      imageUrl: doc.imageUrl,
      foodName: doc.foodName,
      estimatedWeight: doc.estimatedWeight,
      calories: doc.calories,
      protein: doc.protein,
      carbs: doc.carbs,
      fat: doc.fat,
      sugar: doc.sugar,
      aiTips: doc.aiTips,
      isEstimated: doc.isEstimated,
      aiStatus: doc.aiStatus,
      aiProvider: doc.aiProvider,
      createdAt: doc.createdAt,
    });
  }

  async findById(id: string): Promise<MealEntity | null> {
    const meal = await this.mealModel.findById(id).exec();
    return this.mapToEntity(meal);
  }

  async create(meal: Partial<MealEntity>): Promise<MealEntity> {
    const newMeal = new this.mealModel(meal);
    const saved = await newMeal.save();
    return this.mapToEntity(saved)!;
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MealEntity[]> {
    const meals = await this.mealModel
      .find({
        userId,
        createdAt: { $gte: startDate, $lt: endDate },
      })
      .sort({ createdAt: -1 })
      .exec();
    return meals.map((m) => this.mapToEntity(m)!);
  }

  async findByUserIdPaginated(
    userId: string,
    limit: number,
    skip: number,
  ): Promise<{ meals: MealEntity[]; total: number }> {
    const [meals, total] = await Promise.all([
      this.mealModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.mealModel.countDocuments({ userId }).exec(),
    ]);

    return {
      meals: meals.map((m) => this.mapToEntity(m)!),
      total,
    };
  }

  async deleteById(id: string): Promise<MealEntity | null> {
    const deleted = await this.mealModel.findByIdAndDelete(id).exec();
    return this.mapToEntity(deleted);
  }
}
