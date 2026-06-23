import { Suspense } from "react";
import { getDashboardData } from "@/actions/dashboard.actions";
import { redirect } from "next/navigation";
import NutritionCard from "@/components/shared/NutritionCard";
import ProgressRing from "@/components/shared/ProgressRing";
import { TodayMealsList } from "@/components/dashboard/MealList";
import AIInsights from "@/components/dashboard/AIInsights";
import { CaloriesLineChart, MacroBarChart, MacroPieChart } from "@/components/analytics/Charts";
import { getGreeting, getProgressPercentage, formatCalories } from "@/utils";
import { SkeletonCard } from "@/components/shared/Loader";
import Link from "next/link";
import { Upload, Target, Activity } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your daily nutrition progress, meals, and AI coaching insights.",
};

const goalLabels: Record<string, string> = {
  lose_weight: "Losing Weight",
  maintain_weight: "Maintaining Weight",
  gain_weight: "Gaining Weight",
};

export default async function DashboardPage() {
  const result = await getDashboardData();

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-gray-500">Failed to load dashboard. Please refresh.</p>
      </div>
    );
  }

  const { user, todayMeals, todayNutrition, weeklyData, latestTips } = result.data;

  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }

  const calorieProgress = getProgressPercentage(
    todayNutrition.calories,
    user.dailyCalories || 2000
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{user.name} </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <Target size={12} />
              {goalLabels[user.goal || "maintain_weight"] || "Tracking Nutrition"}
            </span>
            {user.bmi && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                <Activity size={12} />
                BMI {user.bmi}
              </span>
            )}
          </div>
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Upload size={16} />
          Log Meal
        </Link>
      </div>

      {/* Daily Progress + Nutrition Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Ring */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center">
          <ProgressRing
            percentage={calorieProgress}
            size={160}
            label={formatCalories(todayNutrition.calories)}
            sublabel={`of ${formatCalories(user.dailyCalories || 2000)} kcal`}
            color="#10B981"
          />
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-gray-900">Daily Calories</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {Math.round((user.dailyCalories || 2000) - todayNutrition.calories)} kcal remaining
            </p>
          </div>
        </div>

        {/* Macro Cards 2x2 */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 gap-4">
          <NutritionCard
            label="Protein"
            consumed={todayNutrition.protein}
            target={user.dailyProtein || 150}
            unit="g"
            color="emerald"
            icon="🥩"
          />
          <NutritionCard
            label="Carbs"
            consumed={todayNutrition.carbs}
            target={user.dailyCarbs || 220}
            unit="g"
            color="blue"
            icon="🌾"
          />
          <NutritionCard
            label="Fat"
            consumed={todayNutrition.fat}
            target={user.dailyFat || 65}
            unit="g"
            color="amber"
            icon="🥑"
          />
          <NutritionCard
            label="Sugar"
            consumed={todayNutrition.sugar}
            target={50}
            unit="g"
            color="rose"
            icon="🍬"
          />
        </div>
      </div>

      {/* Today's Meals + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Today&apos;s Meals
            <span className="ml-2 text-xs font-normal text-gray-400">({todayMeals.length})</span>
          </h2>
          <Suspense fallback={<SkeletonCard />}>
            <TodayMealsList meals={todayMeals} />
          </Suspense>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <AIInsights tips={latestTips} hasData={todayMeals.length > 0} />
        </div>
      </div>

      {/* Weekly Analytics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <CaloriesLineChart data={weeklyData} dailyCalories={user.dailyCalories || 2000} />
          </div>
          <MacroPieChart data={todayNutrition} />
        </div>
        <div className="mt-4">
          <MacroBarChart data={weeklyData} />
        </div>
      </div>
    </div>
  );
}
