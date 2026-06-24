import { ActivityLevel, Gender, Goal } from "@/types";
import { ACTIVITY_LEVELS, BMI_CATEGORIES, CALORIES_PER_GRAM, MACRO_SPLITS } from "@/constants";

export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

export function getBMICategory(bmi: number): string {
  if (bmi < BMI_CATEGORIES.underweight.max) return "Underweight";
  if (bmi < BMI_CATEGORIES.normal.max) return "Normal";
  if (bmi < BMI_CATEGORIES.overweight.max) return "Overweight";
  return "Obese";
}

export function getBMICategoryColor(bmi: number): string {
  if (bmi < BMI_CATEGORIES.underweight.max) return BMI_CATEGORIES.underweight.color;
  if (bmi < BMI_CATEGORIES.normal.max) return BMI_CATEGORIES.normal.color;
  if (bmi < BMI_CATEGORIES.overweight.max) return BMI_CATEGORIES.overweight.color;
  return BMI_CATEGORIES.obese.color;
}

export function recommendGoal(bmi: number): Goal {
  if (bmi < 18.5) return "gain_weight";
  if (bmi <= 24.9) return "maintain_weight";
  return "lose_weight";
}

export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export function calculateDailyCalories(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  const multiplier = ACTIVITY_LEVELS[activityLevel].multiplier;
  return Math.round(bmr * multiplier);
}

export function calculateMacros(dailyCalories: number): {
  protein: number;
  carbs: number;
  fat: number;
} {
  return {
    protein: Math.round(
      (dailyCalories * MACRO_SPLITS.protein) / CALORIES_PER_GRAM.protein
    ),
    carbs: Math.round(
      (dailyCalories * MACRO_SPLITS.carbs) / CALORIES_PER_GRAM.carbs
    ),
    fat: Math.round(
      (dailyCalories * MACRO_SPLITS.fat) / CALORIES_PER_GRAM.fat
    ),
  };
}

export function calculateAllNutritionGoals(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel
): {
  bmi: number;
  goal: Goal;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
} {
  const bmi = calculateBMI(weight, height);
  const goal = recommendGoal(bmi);
  const bmr = calculateBMR(weight, height, age, gender);
  const dailyCalories = calculateDailyCalories(bmr, activityLevel);
  const { protein, carbs, fat } = calculateMacros(dailyCalories);

  return {
    bmi,
    goal,
    dailyCalories,
    dailyProtein: protein,
    dailyCarbs: carbs,
    dailyFat: fat,
  };
}
