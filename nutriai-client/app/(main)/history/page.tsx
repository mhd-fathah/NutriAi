"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { mealService } from "@/services/meal.service";
import { HistoryData, MealRecord } from "@/types";
import { formatDate, formatTime } from "@/utils";
import { MEAL_TYPES } from "@/constants";
import { CaloriesLineChart } from "@/components/analytics/Charts";
import EmptyState from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/Loader";
import { cn } from "@/utils";
import Link from "next/link";
import Button from "@/components/shared/Button";
import { Calendar, Flame, Layers, Sparkles, TrendingUp, ChevronDown, ChevronUp, ShieldCheck, Shield, AlertTriangle } from "lucide-react";

type Period = "daily" | "weekly" | "monthly";

const tabs: { value: Period; label: string }[] = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
];

function SummaryCard({ label, value, unit, icon, color }: { label: string; value: number; unit: string; icon: string; color: "emerald" | "blue" | "amber" | "rose" | "purple" }) {
  const colorMap = {
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400", border: "border-emerald-100/50 dark:border-emerald-900/30" },
    blue: { bg: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400", border: "border-blue-100/50 dark:border-blue-900/30" },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400", border: "border-amber-100/50 dark:border-amber-900/30" },
    rose: { bg: "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400", border: "border-rose-100/50 dark:border-rose-900/30" },
    purple: { bg: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400", border: "border-purple-100/50 dark:border-purple-900/30" }
  };
  const theme = colorMap[color] || colorMap.emerald;

  return (
    <div className={cn("bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-5 shadow-xl shadow-gray-100/40 dark:shadow-none hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all duration-300 relative overflow-hidden group", theme.border)}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 dark:bg-zinc-800/20 rounded-full -mr-12 -mt-12 blur-2xl opacity-50 group-hover:scale-125 transition-transform duration-500" />
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-lg font-semibold", theme.bg)}>
          {icon}
        </div>
      </div>
      <div className="space-y-1 relative z-10">
        <p className="text-xs text-gray-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 leading-none">
          {Math.round(value)}
          <span className="text-sm font-semibold text-gray-400 dark:text-zinc-500 ml-0.5">{unit}</span>
        </p>
      </div>
    </div>
  );
}

function MealHistoryCard({ meal }: { meal: MealRecord }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const mealInfo = MEAL_TYPES[meal.mealType];

  const confidence = meal.confidence ?? 100;
  let confidenceColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  let confidenceLabel = "High Confidence";
  let ConfidenceIcon = ShieldCheck;

  if (confidence < 70) {
    confidenceColor = "text-red-500 bg-red-500/10 border-red-500/20";
    confidenceLabel = "Low Confidence";
    ConfidenceIcon = AlertTriangle;
  } else if (confidence < 90) {
    confidenceColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    confidenceLabel = "Medium Confidence";
    ConfidenceIcon = Shield;
  }

  return (
    <div 
      className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 shadow-inner">
            <Image 
              src={meal.imageUrl ? meal.imageUrl : "/images/food-placeholder.jpg"} 
              alt={meal.foodName} 
              fill 
              className="object-cover hover:scale-105 transition-transform duration-500" 
              sizes="80px" 
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="font-bold text-gray-900 dark:text-zinc-100 text-lg tracking-tight truncate">{meal.foodName}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 px-2.5 py-1 rounded-full font-semibold">
                {mealInfo?.icon} {mealInfo?.label}
              </span>
              <span className="text-xs font-medium text-gray-400 dark:text-zinc-500">{formatDate(meal.createdAt)}</span>
              <span className="text-xs font-medium text-gray-400 dark:text-zinc-500">&bull; {formatTime(meal.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50 dark:border-zinc-800/80 flex-shrink-0">
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">{meal.calories} kcal</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">P: {meal.protein}g</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400">C: {meal.carbs}g</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">F: {meal.fat}g</span>
          </div>
          <div className="hidden sm:block text-gray-400 dark:text-zinc-500 mt-1">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800/80 space-y-4 animate-fade-in">
          {/* Confidence Score & Version */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${confidenceColor} font-medium`}>
              <ConfidenceIcon size={12} />
              {confidenceLabel} ({confidence}%)
            </span>
            {meal.analysisVersion && (
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                AI Engine v{meal.analysisVersion}
              </span>
            )}
          </div>

          {/* Detailed Portion breakdown */}
          {meal.foods && meal.foods.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                Ingredients / Portions
              </h4>
              <div className="divide-y divide-gray-100/50 dark:divide-zinc-800/50">
                {meal.foods.map((food, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-start text-xs">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-zinc-200">{food.name}</p>
                      <p className="text-gray-400 dark:text-zinc-500 text-[11px]">
                        {food.portion} • {food.estimatedWeight}g
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-500">{food.calories} kcal</p>
                      <p className="text-gray-400 dark:text-zinc-500 text-[10px]">
                        P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Micro Summary */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-zinc-800/40 rounded-xl border border-gray-100/20 dark:border-zinc-800/30">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-zinc-500">Fiber</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{meal.fiber ?? 0}g</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-zinc-500">Sodium</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{meal.sodium ?? 0}mg</p>
            </div>
          </div>

          {/* AI Tips / Insights */}
          {meal.aiTips && meal.aiTips.length > 0 && (() => {
            let parsedCoaching: { summary: string; recommendations: Array<{ category: string; text: string; why: string }> } | null = null;
            try {
              if (meal.aiTips[0]?.startsWith("{")) {
                parsedCoaching = JSON.parse(meal.aiTips[0]);
              }
            } catch (e) {
              console.error("Failed to parse meal coaching tips JSON", e);
            }

            return (
              <div className="space-y-2 border-t border-gray-150/40 dark:border-zinc-800/40 pt-3 mt-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Sparkles size={14} />
                  <span>Coach Insights</span>
                </div>
                {parsedCoaching ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-700 dark:text-zinc-300 italic font-medium">{parsedCoaching.summary}</p>
                    <div className="space-y-2 pl-2 border-l-2 border-emerald-500/20 dark:border-emerald-500/10">
                      {parsedCoaching.recommendations.map((rec, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-bold text-gray-800 dark:text-zinc-200">
                            [{rec.category}] {rec.text}
                          </span>{" "}
                          <span className="text-gray-400 dark:text-zinc-550 font-medium">- {rec.why}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ul className="list-disc pl-4 space-y-1 text-xs text-gray-600 dark:text-zinc-350">
                    {meal.aiTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })()}
        </div>
      )}
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
      try {
        const result = await mealService.getMealsHistory(period);
        if (result.success && result.data) {
          setData(result.data);
        }
      } catch (err: any) {
        if (err?.status === 401) {
          const { signOut } = await import("next-auth/react");
          signOut({ callbackUrl: "/login" });
        }
      } finally {
        setLoading(false);
      }
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
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* SECTION 1: PREMIUM HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/10 bg-gradient-to-br from-emerald-950 via-slate-900 to-black p-6 md:p-8 shadow-xl shadow-emerald-500/5">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs md:text-sm font-semibold tracking-wider text-emerald-400 uppercase">
              Meal Analytics
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
              🥗 Meal History
            </h1>
            <p className="text-sm text-gray-300 max-w-xl">
              Track your nutrition journey, analyze eating patterns, and measure daily macro distributions.
            </p>
            {data && (
              <div className="flex items-center gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <Layers size={12} />
                  {data.meals.length} {data.meals.length === 1 ? "Meal" : "Meals"} Logged
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                  <Flame size={12} />
                  {Math.round(data.summary.totalCalories)} Total Calories
                </span>
              </div>
            )}
          </div>
          
          {/* SECTION 2: PERIOD FILTERS */}
          <div className="flex-shrink-0 bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md self-start md:self-auto">
            <div className="flex items-center gap-1">
              {tabs.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPeriod(value)}
                  className={cn(
                    "px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all duration-200",
                    period === value
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : data ? (
        <>
          {/* SECTION 3: NUTRITION OVERVIEW */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <SummaryCard label="Total Calories" value={data.summary.totalCalories} unit="kcal" icon="🔥" color="rose" />
            <SummaryCard label="Daily Average" value={data.summary.avgCalories} unit="kcal/day" icon="📊" color="purple" />
            <SummaryCard label="Total Protein" value={data.summary.totalProtein} unit="g" icon="🥩" color="emerald" />
            <SummaryCard label="Total Carbs" value={data.summary.totalCarbs} unit="g" icon="🌾" color="blue" />
            <SummaryCard label="Total Fat" value={data.summary.totalFat} unit="g" icon="🥑" color="amber" />
          </div>

          {/* SECTION 4: TREND ANALYTICS */}
          {period !== "daily" && chartData.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-100/40 dark:shadow-none p-6 md:p-8 transition-all duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Calorie Trends</h2>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">View calorie intake patterns and comparisons</p>
                </div>
              </div>
              <CaloriesLineChart data={chartData} dailyCalories={0} />
            </div>
          )}

          {/* SECTION 5: MEAL HISTORY TIMELINE */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Timeline Log</h2>
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold">List of logged meals in this cycle</p>
              </div>
            </div>
            
            {data.meals.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-100/40 dark:shadow-none p-8">
                <EmptyState
                  icon="📋"
                  title="No meals logged yet"
                  description={`You haven't logged any meals ${period === "daily" ? "today" : period === "weekly" ? "this week" : "this month"} yet. Let's record your next meal!`}
                  action={
                    <Link href="/upload">
                      <Button size="sm">Log first meal</Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="space-y-4">
                {data.meals.map((meal, idx) => (
                  <MealHistoryCard key={meal._id || meal.id || `hist-${idx}`} meal={meal} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
