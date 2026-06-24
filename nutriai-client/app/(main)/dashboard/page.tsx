import { Suspense } from "react";
import { analyticsService } from "@/services/analytics.service";
import { redirect } from "next/navigation";
import NutritionCard from "@/components/shared/NutritionCard";
import ProgressRing from "@/components/shared/ProgressRing";
import { TodayMealsList } from "@/components/dashboard/MealList";
import AIInsights from "@/components/dashboard/AIInsights";
import { CaloriesLineChart, MacroBarChart, MacroPieChart } from "@/components/analytics/Charts";
import { getGreeting, getProgressPercentage, formatCalories } from "@/utils";
import { SkeletonCard } from "@/components/shared/Loader";
import Link from "next/link";
import { Upload, Target, Activity, Flame, Sparkles } from "lucide-react";
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
  let result;
  try {
    result = await analyticsService.getDashboardData();
  } catch (error: any) {
    if (error?.status === 401) {
      redirect("/login");
    }
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-gray-550 dark:text-zinc-400">Failed to load dashboard: {error?.error || "Please sign in again."}</p>
      </div>
    );
  }

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-gray-500">Failed to load dashboard. Please refresh.</p>
      </div>
    );
  }

  const { user, todayMeals, todayNutrition, weeklyData, latestTips, streak } = result.data;

  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }

  const calorieProgress = getProgressPercentage(
    todayNutrition.calories,
    user.dailyCalories || 2000
  );

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* SECTION 1: PREMIUM HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/10 bg-gradient-to-br from-emerald-950 via-slate-900 to-black p-6 md:p-8 shadow-xl shadow-emerald-500/5">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs md:text-sm font-semibold tracking-wider text-emerald-400 uppercase">
              {getGreeting()}
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {user.name}
            </h1>
            <p className="text-sm text-gray-300 max-w-xl">
              Stay consistent today and hit your nutrition goals. Your progress is looking solid!
            </p>
            
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full backdrop-blur-md">
                <Target size={13} className="text-emerald-400" />
                Goal: {goalLabels[user.goal || "maintain_weight"] || "Tracking Nutrition"}
              </span>
              {user.bmi && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full backdrop-blur-md">
                  <Activity size={13} className="text-blue-400" />
                  BMI: {user.bmi}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full backdrop-blur-md">
                <Flame size={13} className="text-amber-400 fill-amber-400/20" />
                Streak: {streak || 0} {streak === 1 ? "Day" : "Days"}
              </span>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Upload size={16} />
              Log Meal
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: CALORIE OVERVIEW + MACRO CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 2: CALORIE OVERVIEW */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-100/40 dark:shadow-black/10 p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-2xl dark:hover:shadow-black/20 hover:shadow-gray-200/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-950/20 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 dark:opacity-20 group-hover:scale-125 transition-transform duration-500" />
          
          <ProgressRing
            percentage={calorieProgress}
            size={180}
            strokeWidth={14}
            label={formatCalories(todayNutrition.calories)}
            sublabel={`of ${formatCalories(user.dailyCalories || 2000)} kcal`}
            color="#10B981"
            bgColor="#F3F4F6"
            className="drop-shadow-sm"
          />
          
          <div className="mt-6 text-center space-y-1">
            <p className="text-sm font-bold text-gray-900 dark:text-zinc-150 tracking-tight">Daily Calories</p>
            <p className="text-xs text-gray-500">
              {Math.round((user.dailyCalories || 2000) - todayNutrition.calories) > 0 ? (
                <span className="font-semibold text-emerald-600 dark:text-emerald-450">
                  {Math.round((user.dailyCalories || 2000) - todayNutrition.calories)} kcal remaining
                </span>
              ) : (
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {Math.abs(Math.round((user.dailyCalories || 2000) - todayNutrition.calories))} kcal over target
                </span>
              )}
            </p>
          </div>
        </div>

        {/* SECTION 3: MACRO CARDS */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <NutritionCard
            label="Protein"
            consumed={todayNutrition.protein}
            target={user.dailyProtein || 150}
            unit="g"
            color="emerald"
            icon="🥩"
            className="rounded-3xl hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-gray-100/40 dark:shadow-none hover:shadow-2xl hover:shadow-gray-200/50 border-gray-100 dark:border-zinc-800"
          />
          <NutritionCard
            label="Carbs"
            consumed={todayNutrition.carbs}
            target={user.dailyCarbs || 220}
            unit="g"
            color="blue"
            icon="🌾"
            className="rounded-3xl hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-gray-100/40 dark:shadow-none hover:shadow-2xl hover:shadow-gray-200/50 border-gray-100 dark:border-zinc-800"
          />
          <NutritionCard
            label="Fat"
            consumed={todayNutrition.fat}
            target={user.dailyFat || 65}
            unit="g"
            color="amber"
            icon="🥑"
            className="rounded-3xl hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-gray-100/40 dark:shadow-none hover:shadow-2xl hover:shadow-gray-200/50 border-gray-100 dark:border-zinc-800"
          />
          <NutritionCard
            label="Sugar"
            consumed={todayNutrition.sugar}
            target={50}
            unit="g"
            color="rose"
            icon="🍬"
            className="rounded-3xl hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-gray-100/40 dark:shadow-none hover:shadow-2xl hover:shadow-gray-200/50 border-gray-100 dark:border-zinc-800"
          />
        </div>
      </div>

      {/* SECTION 4 & 5: TODAY'S MEALS + AI INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION 4: TODAY'S MEALS */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-100/40 dark:shadow-black/10 p-6 md:p-8 hover:shadow-2xl dark:hover:shadow-black/20 hover:shadow-gray-200/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Today&apos;s Meals</h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Meals registered throughout the day</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              {todayMeals.length} logged
            </span>
          </div>
          <Suspense fallback={<SkeletonCard />}>
            <TodayMealsList meals={todayMeals} />
          </Suspense>
        </div>

        {/* SECTION 5: AI INSIGHTS */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-100/40 dark:shadow-black/10 p-6 md:p-8 hover:shadow-2xl dark:hover:shadow-black/20 hover:shadow-gray-200/50 transition-all duration-300">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 tracking-tight">AI Insights</h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Personalized diet and coach recommendations</p>
            </div>
          </div>
          <AIInsights tips={latestTips} hasData={todayMeals.length > 0} />
        </div>
      </div>

      {/* SECTION 6: ANALYTICS */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-100/40 dark:shadow-black/10 p-6 md:p-8 hover:shadow-2xl dark:hover:shadow-black/20 hover:shadow-gray-200/50 transition-all duration-300">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Weekly Analytics</h2>
          <p className="text-xs text-gray-400 dark:text-zinc-550 font-medium">Visual representations of nutrition progression</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4">
            <CaloriesLineChart data={weeklyData} dailyCalories={user.dailyCalories || 2000} />
          </div>
          <div className="bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-center">
            <MacroPieChart data={todayNutrition} />
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4">
          <MacroBarChart data={weeklyData} />
        </div>
      </div>
    </div>
  );
}
