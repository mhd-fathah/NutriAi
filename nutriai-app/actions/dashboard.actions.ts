"use server";

import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/infrastructure/database/mongodb";
import User from "@/models/User";
import Meal from "@/models/Meal";
import { getStartOfDay, getEndOfDay, getWeekRange } from "@/utils";
import { DashboardData, MealRecord, UserProfile, WeeklyDataPoint } from "@/types";
import { ActionResult } from "@/types";

export async function getDashboardData(): Promise<ActionResult<DashboardData>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = session.user.id;

  try {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    // Today's meals
    const todayMealsRaw = await Meal.find({
      userId: userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    const todayMeals: MealRecord[] = todayMealsRaw.map((m) => ({
      _id: m._id.toString(),
      userId: userId,
      mealType: m.mealType,
      imageUrl: m.imageUrl,
      foodName: m.foodName,
      estimatedWeight: m.estimatedWeight,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      sugar: m.sugar,
      aiTips: m.aiTips,
      isEstimated: m.isEstimated || false,
      aiStatus: m.aiStatus || "success",
      aiProvider: m.aiProvider || "gemini",
      createdAt: m.createdAt.toISOString(),
    }));

    // Today's totals
    const todayNutrition = todayMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
        sugar: acc.sugar + m.sugar,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 }
    );

    // Weekly data for charts (last 7 days)
    const { start: weekStart } = getWeekRange();
    const weeklyMeals = await Meal.find({
      userId: userId,
      createdAt: { $gte: weekStart },
    }).sort({ createdAt: 1 });

    // Group by day
    const weeklyMap = new Map<string, WeeklyDataPoint>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      weeklyMap.set(key, {
        date: d.toLocaleDateString("en-US", { weekday: "short" }),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
    }

    weeklyMeals.forEach((m) => {
      const key = m.createdAt.toISOString().split("T")[0];
      const existing = weeklyMap.get(key);
      if (existing) {
        existing.calories += m.calories;
        existing.protein += m.protein;
        existing.carbs += m.carbs;
        existing.fat += m.fat;
      }
    });

    const weeklyData = Array.from(weeklyMap.values());

    // Calculate Streak Dynamically
    const allMeals = await Meal.find({ userId: userId }).sort({ createdAt: -1 });
    let streak = 0;
    if (allMeals.length > 0) {
      const mealDates = allMeals.map(m => {
        const d = new Date(m.createdAt);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      });
      const uniqueSortedDates = Array.from(new Set(mealDates)).sort((a, b) => b - a);

      const today = new Date();
      const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const yesterdayTime = todayTime - 24 * 60 * 60 * 1000;

      // Ensure user logged a meal today or at least yesterday to maintain streak
      if (uniqueSortedDates[0] === todayTime || uniqueSortedDates[0] === yesterdayTime) {
        streak = 1;
        for (let i = 0; i < uniqueSortedDates.length - 1; i++) {
          if (uniqueSortedDates[i] - uniqueSortedDates[i + 1] === 24 * 60 * 60 * 1000) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // Latest tips from most recent meal
    const latestTips = todayMeals[0]?.aiTips || [];

    const userProfile: UserProfile = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      activityLevel: user.activityLevel as UserProfile["activityLevel"],
      bmi: user.bmi,
      goal: user.goal as UserProfile["goal"],
      dailyCalories: user.dailyCalories,
      dailyProtein: user.dailyProtein,
      dailyCarbs: user.dailyCarbs,
      dailyFat: user.dailyFat,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return {
      success: true,
      data: {
        user: userProfile,
        todayMeals,
        todayNutrition,
        weeklyData,
        latestTips,
        streak,
      },
    };
  } catch {
    return { success: false, error: "Failed to load dashboard data" };
  }
}
