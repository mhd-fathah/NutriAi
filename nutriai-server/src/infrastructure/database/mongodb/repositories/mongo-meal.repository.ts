import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meal, MealDocument } from '../schemas/meal.schema';
import { IMealRepository } from '../../../../domain/repositories/meal.repository.interface';
import { MealEntity } from '../../../../domain/entities/meal.entity';
import { InMemoryCacheService } from './cache.service';

@Injectable()
export class MongoMealRepository implements IMealRepository {
  constructor(
    @InjectModel(Meal.name) private readonly mealModel: Model<MealDocument>,
    private readonly cacheService: InMemoryCacheService,
  ) {}

  private mapToEntity(doc: any | null): MealEntity | null {
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
      fiber: doc.fiber || 0,
      sodium: doc.sodium || 0,
      confidence: doc.confidence ?? 100,
      analysisVersion: doc.analysisVersion || '1.0',
      foods: (doc.foods || []).map((f) => ({
        name: f.name,
        portion: f.portion,
        estimatedWeight: f.estimatedWeight,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        sugar: f.sugar,
        fiber: f.fiber,
        sodium: f.sodium,
      })),
      aiTips: doc.aiTips,
      isEstimated: doc.isEstimated,
      aiStatus: doc.aiStatus,
      aiProvider: doc.aiProvider,
      createdAt: doc.createdAt,
    });
  }

  async findById(id: string): Promise<MealEntity | null> {
    const meal = await this.mealModel.findById(id).lean().exec();
    return this.mapToEntity(meal);
  }

  async create(meal: Partial<MealEntity>): Promise<MealEntity> {
    const newMeal = new this.mealModel(meal);
    const saved = await newMeal.save();
    if (saved && saved.userId) {
      this.cacheService.delete(`dashboard_${saved.userId.toString()}`);
    }
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
      .lean()
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
        .lean()
        .exec(),
      this.mealModel.countDocuments({ userId }).lean().exec(),
    ]);

    return {
      meals: meals.map((m) => this.mapToEntity(m)!),
      total,
    };
  }

  async deleteById(id: string): Promise<MealEntity | null> {
    const deleted = await this.mealModel.findByIdAndDelete(id).lean().exec();
    if (deleted && deleted.userId) {
      this.cacheService.delete(`dashboard_${deleted.userId.toString()}`);
    }
    return this.mapToEntity(deleted);
  }
}
