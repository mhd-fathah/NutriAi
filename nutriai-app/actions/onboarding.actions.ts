"use server";

import { auth, unstable_update } from "@/lib/auth/auth";
import { connectDB } from "@/infrastructure/database/mongodb";
import User from "@/models/User";
import { OnboardingSchema } from "@/lib/validations";
import { calculateAllNutritionGoals } from "@/lib/calculations/nutrition";
import { ActionResult } from "@/types";

export async function completeOnboarding(
  data: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const validated = OnboardingSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const { age, gender, height, weight, activityLevel } = validated.data;

  const goals = calculateAllNutritionGoals(weight, height, age, gender, activityLevel);

  try {
    await connectDB();
    await User.findByIdAndUpdate(session.user.id, {
      age,
      gender,
      height,
      weight,
      activityLevel,
      bmi: goals.bmi,
      goal: goals.goal,
      dailyCalories: goals.dailyCalories,
      dailyProtein: goals.dailyProtein,
      dailyCarbs: goals.dailyCarbs,
      dailyFat: goals.dailyFat,
      onboardingCompleted: true,
    });

    // Update NextAuth session cookie server-side
    await unstable_update({
      user: {
        ...session.user,
        onboardingCompleted: true,
      }
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to save profile. Please try again." };
  }
}
