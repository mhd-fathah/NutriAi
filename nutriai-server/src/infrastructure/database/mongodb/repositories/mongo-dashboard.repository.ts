import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meal, MealDocument } from '../schemas/meal.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { IDashboardRepository } from '../../../../domain/repositories/dashboard.repository.interface';

@Injectable()
export class MongoDashboardRepository implements IDashboardRepository {
  private readonly logger = new Logger(MongoDashboardRepository.name);

  constructor(
    @InjectModel(Meal.name) private readonly mealModel: Model<MealDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getDashboardOverview(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const dbStartTime = Date.now();

    // Perform queries in parallel to optimize database round trips
    const [userDoc, todayMealsDocs, todayNutritionResults, weeklyStats, mealDatesDocs] = await Promise.all([
      this.userModel.findById(userId).lean().exec(),
      this.mealModel
        .find({
          userId: new Types.ObjectId(userId),
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.mealModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            createdAt: { $gte: startOfDay, $lte: endOfDay },
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
          },
        },
      ]),
      this.mealModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            createdAt: { $gte: weekStart, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            calories: { $sum: '$calories' },
            protein: { $sum: '$protein' },
            carbs: { $sum: '$carbs' },
            fat: { $sum: '$fat' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      this.mealModel
        .find({ userId: new Types.ObjectId(userId) })
        .select('createdAt')
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
    ]);

    const dbEndTime = Date.now();
    this.logger.log(`[Database Execution Time] ${dbEndTime - dbStartTime}ms`);

    if (!userDoc) {
      throw new NotFoundException('User not found');
    }

    // Map today's aggregated nutrition
    const todayNutrition = {
      calories: Math.round(todayNutritionResults[0]?.calories || 0),
      protein: Math.round(todayNutritionResults[0]?.protein || 0),
      carbs: Math.round(todayNutritionResults[0]?.carbs || 0),
      fat: Math.round(todayNutritionResults[0]?.fat || 0),
      sugar: Math.round(todayNutritionResults[0]?.sugar || 0),
    };

    // Calculate streak
    let streak = 0;
    if (mealDatesDocs && mealDatesDocs.length > 0) {
      const dayTimes = mealDatesDocs.map((d: any) => {
        const dateObj = new Date(d.createdAt);
        return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
      });
      const uniqueSortedDates = Array.from(new Set(dayTimes)).sort(
        (a, b) => b - a,
      );

      const today = new Date();
      const todayTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ).getTime();
      const yesterdayTime = todayTime - 24 * 60 * 60 * 1000;

      if (
        uniqueSortedDates[0] === todayTime ||
        uniqueSortedDates[0] === yesterdayTime
      ) {
        streak = 1;
        for (let i = 0; i < uniqueSortedDates.length - 1; i++) {
          if (
            uniqueSortedDates[i] - uniqueSortedDates[i + 1] ===
            24 * 60 * 60 * 1000
          ) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // Build the 7-day stats map
    const weeklyMap = new Map<string, { date: string; calories: number; protein: number; carbs: number; fat: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      weeklyMap.set(key, {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
    }

    weeklyStats.forEach((stat) => {
      const key = stat._id;
      const existing = weeklyMap.get(key);
      if (existing) {
        existing.calories = Math.round(stat.calories || 0);
        existing.protein = Math.round(stat.protein || 0);
        existing.carbs = Math.round(stat.carbs || 0);
        existing.fat = Math.round(stat.fat || 0);
      }
    });

    const weeklyAnalytics = Array.from(weeklyMap.values());

    // Map today's meals list
    const todayMeals = todayMealsDocs.map((m: any) => ({
      id: m._id.toString(),
      _id: m._id.toString(), // Support both formats
      mealType: m.mealType,
      imageUrl: m.imageUrl,
      foodName: m.foodName,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      createdAt: m.createdAt,
      aiTips: m.aiTips,
      confidence: m.confidence,
      estimatedWeight: m.estimatedWeight,
      foods: m.foods,
      analysisVersion: m.analysisVersion,
      isEstimated: m.isEstimated,
      aiStatus: m.aiStatus,
      aiProvider: m.aiProvider,
    }));

    // Calculate dynamic deficit summary
    const summary = {
      remainingCalories: Math.max(0, (userDoc.dailyCalories || 2000) - todayNutrition.calories),
      remainingProtein: Math.max(0, (userDoc.dailyProtein || 150) - todayNutrition.protein),
      remainingCarbs: Math.max(0, (userDoc.dailyCarbs || 250) - todayNutrition.carbs),
      remainingFat: Math.max(0, (userDoc.dailyFat || 70) - todayNutrition.fat),
    };

    const userProfile = {
      name: userDoc.name,
      goal: userDoc.goal || 'maintain_weight',
      bmi: userDoc.bmi || 0,
      dailyCalories: userDoc.dailyCalories || 2000,
      dailyProtein: userDoc.dailyProtein || 150,
      dailyCarbs: userDoc.dailyCarbs || 250,
      dailyFat: userDoc.dailyFat || 70,
      onboardingCompleted: userDoc.onboardingCompleted,
    };

    return {
      user: userProfile,
      todayNutrition,
      todayMeals,
      weeklyAnalytics,
      weeklyData: weeklyAnalytics, // Alias for backward compatibility
      aiInsights: todayMeals[0]?.aiTips || [],
      latestTips: todayMeals[0]?.aiTips || [], // Alias for backward compatibility
      summary,
      streak,
    };
  }
}
