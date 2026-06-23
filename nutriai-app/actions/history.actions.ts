"use server";

import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/infrastructure/database/mongodb";
import Meal from "@/models/Meal";
import { getStartOfDay, getEndOfDay, getWeekRange, getMonthRange } from "@/utils";
import { ActionResult, HistoryData, MealRecord } from "@/types";

type Period = "daily" | "weekly" | "monthly";

export async function getMealHistory(
  period: Period = "daily"
): Promise<ActionResult<HistoryData>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = session.user.id;

  try {
    await connectDB();

    let start: Date;
    let end: Date = new Date();

    if (period === "daily") {
      start = getStartOfDay();
      end = getEndOfDay();
    } else if (period === "weekly") {
      start = getWeekRange().start;
    } else {
      start = getMonthRange().start;
    }

    const mealsRaw = await Meal.find({
      userId: userId,
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });

    const meals: MealRecord[] = mealsRaw.map((m) => ({
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

    const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
    const days = period === "daily" ? 1 : period === "weekly" ? 7 : 30;

    return {
      success: true,
      data: {
        meals,
        summary: {
          totalCalories,
          avgCalories: meals.length ? Math.round(totalCalories / days) : 0,
          totalProtein: meals.reduce((s, m) => s + m.protein, 0),
          totalCarbs: meals.reduce((s, m) => s + m.carbs, 0),
          totalFat: meals.reduce((s, m) => s + m.fat, 0),
        },
      },
    };
  } catch {
    return { success: false, error: "Failed to load history" };
  }
}
