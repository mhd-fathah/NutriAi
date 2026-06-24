import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meal, MealDocument } from '../schemas/meal.schema';
import { IAnalyticsRepository } from '../../../../domain/repositories/analytics.repository.interface';

@Injectable()
export class MongoAnalyticsRepository implements IAnalyticsRepository {
  constructor(
    @InjectModel(Meal.name) private readonly mealModel: Model<MealDocument>,
  ) {}

  async getDailyStatsForRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ date: string; calories: number; protein: number; carbs: number; fat: number }>> {
    const results = await this.mealModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          calories: { $sum: '$calories' },
          protein: { $sum: '$protein' },
          carbs: { $sum: '$carbs' },
          fat: { $sum: '$fat' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return results.map((r) => ({
      date: r._id,
      calories: r.calories,
      protein: r.protein,
      carbs: r.carbs,
      fat: r.fat,
    }));
  }

  async getNutritionTotalsForRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ calories: number; protein: number; carbs: number; fat: number; sugar: number; fiber: number; sodium: number }> {
    const results = await this.mealModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          calories: { $sum: '$calories' },
          protein: { $sum: '$protein' },
          carbs: { $sum: '$carbs' },
          fat: { $sum: '$fat' },
          sugar: { $sum: '$sugar' },
          fiber: { $sum: '$fiber' },
          sodium: { $sum: '$sodium' },
        },
      },
    ]);

    if (results.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0, sodium: 0 };
    }

    return {
      calories: results[0].calories,
      protein: results[0].protein,
      carbs: results[0].carbs,
      fat: results[0].fat,
      sugar: results[0].sugar,
      fiber: results[0].fiber || 0,
      sodium: results[0].sodium || 0,
    };
  }

  async getMealDatesDescending(userId: string): Promise<Date[]> {
    const meals = await this.mealModel
      .find({ userId })
      .select('createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return meals.map((m) => m.createdAt);
  }
}
