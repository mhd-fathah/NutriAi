"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getMealHistory } from "@/actions/history.actions";
import { HistoryData, MealRecord } from "@/types";
import { formatDate, formatTime } from "@/utils";
import { MEAL_TYPES } from "@/constants";
import { CaloriesLineChart } from "@/components/analytics/Charts";
import EmptyState from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/Loader";
import { cn } from "@/utils";

type Period = "daily" | "weekly" | "monthly";

const tabs: { value: Period; label: string }[] = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
];

function SummaryCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{Math.round(value)}<span className="text-sm font-normal text-gray-400 ml-0.5">{unit}</span></p>
    </div>
  );
}

function MealHistoryCard({ meal }: { meal: MealRecord }) {
  const mealInfo = MEAL_TYPES[meal.mealType];
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-all">
      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        <Image src={meal.imageUrl ? meal.imageUrl : "/images/food-placeholder.jpg"} alt={meal.foodName} fill className="object-cover" sizes="64px" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{meal.foodName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {mealInfo?.icon} {mealInfo?.label}
          </span>
          <span className="text-xs text-gray-400">{formatDate(meal.createdAt)}</span>
          <span className="text-xs text-gray-400">{formatTime(meal.createdAt)}</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm font-semibold text-emerald-600">{meal.calories} kcal</span>
          <span className="text-xs text-gray-400">P: {meal.protein}g</span>
          <span className="text-xs text-gray-400">C: {meal.carbs}g</span>
          <span className="text-xs text-gray-400">F: {meal.fat}g</span>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getMealHistory(period);
      if (result.success && result.data) {
        setData(result.data);
      }
      setLoading(false);
    };
    fetchData();
  }, [period]);

  // Build weekly chart data from meal history
  const chartData = data
    ? (() => {
        const map = new Map<string, { date: string; calories: number; protein: number; carbs: number; fat: number }>();
        data.meals.forEach((m) => {
          const key = m.createdAt.split("T")[0];
          const day = new Date(m.createdAt).toLocaleDateString("en-US", { weekday: "short" });
          const existing = map.get(key) || { date: day, calories: 0, protein: 0, carbs: 0, fat: 0 };
          existing.calories += m.calories;
          existing.protein += m.protein;
          existing.carbs += m.carbs;
          existing.fat += m.fat;
          map.set(key, existing);
        });
        return Array.from(map.values());
      })()
    : [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meal History</h1>
        <p className="text-sm text-gray-500 mt-1">Track your nutrition over time</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={cn(
              "px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              period === value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <SummaryCard label="Total Calories" value={data.summary.totalCalories} unit="kcal" />
            <SummaryCard label="Daily Average" value={data.summary.avgCalories} unit="kcal/day" />
            <SummaryCard label="Total Protein" value={data.summary.totalProtein} unit="g" />
            <SummaryCard label="Total Carbs" value={data.summary.totalCarbs} unit="g" />
            <SummaryCard label="Total Fat" value={data.summary.totalFat} unit="g" />
          </div>

          {/* Chart (for weekly/monthly) */}
          {period !== "daily" && chartData.length > 0 && (
            <CaloriesLineChart data={chartData} dailyCalories={0} />
          )}

          {/* Meals list */}
          {data.meals.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No meals found"
              description={`You haven't logged any meals ${period === "daily" ? "today" : period === "weekly" ? "this week" : "this month"} yet.`}
            />
          ) : (
            <div className="space-y-3">
              {data.meals.map((meal) => (
                <MealHistoryCard key={meal._id} meal={meal} />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
