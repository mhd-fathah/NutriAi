export type Gender = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extra_active";

export type Goal = "lose_weight" | "maintain_weight" | "gain_weight";

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export interface NutritionValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  age?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  activityLevel?: ActivityLevel;
  bmi?: number;
  goal?: Goal;
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  onboardingCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MealRecord {
  _id: string;
  userId: string;
  mealType: MealType;
  imageUrl: string;
  foodName: string;
  estimatedWeight: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  aiTips: string[];
  isEstimated: boolean;
  aiStatus: "success" | "fallback";
  aiProvider: "gemini" | "local";
  createdAt: string;
}

export interface GeminiNutritionResponse {
  foodName: string;
  estimatedWeight: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
}

export interface GeminiTipsResponse {
  tips: string[];
}

export interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
}

export interface DashboardData {
  user: UserProfile;
  todayMeals: MealRecord[];
  todayNutrition: DailyNutrition;
  weeklyData: WeeklyDataPoint[];
  latestTips: string[];
  streak?: number;
}

export interface WeeklyDataPoint {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface HistoryData {
  meals: MealRecord[];
  summary: {
    totalCalories: number;
    avgCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  };
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
