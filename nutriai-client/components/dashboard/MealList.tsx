"use client";

import { useState, memo } from "react";
import Image from "next/image";
import { formatTime } from "@/utils";
import { MealRecord } from "@/types";
import { MEAL_TYPES } from "@/constants";
import EmptyState from "@/components/shared/EmptyState";
import Link from "next/link";
import Button from "@/components/shared/Button";
import { ChevronDown, ChevronUp, Sparkles, Shield, AlertTriangle, ShieldCheck } from "lucide-react";

export const MealCard = memo(function MealCard({ meal }: { meal: MealRecord }) {
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
      className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-zinc-800">
          <Image
            src={meal.imageUrl ? meal.imageUrl : "/images/food-placeholder.jpg"}
            alt={meal.foodName}
            fill
            className="object-cover"
            sizes="56px"
            priority
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
              {mealInfo?.icon} {mealInfo?.label}
            </span>
            <span className="text-xs text-gray-400 dark:text-zinc-500">{formatTime(meal.createdAt)}</span>
          </div>
          <p className="font-semibold text-gray-900 dark:text-zinc-50 text-sm truncate">{meal.foodName}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">{meal.calories} kcal</span>
            <span className="text-xs text-gray-400 dark:text-zinc-500">P: {meal.protein}g</span>
            <span className="text-xs text-gray-400 dark:text-zinc-500">C: {meal.carbs}g</span>
            <span className="text-xs text-gray-400 dark:text-zinc-500">F: {meal.fat}g</span>
          </div>
        </div>
        <div className="text-gray-400 dark:text-zinc-500">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
});

export const TodayMealsList = memo(function TodayMealsList({ meals }: { meals: MealRecord[] }) {
  if (meals.length === 0) {
    return (
      <EmptyState
        icon="🍽️"
        title="No meals scanned today"
        description="Upload a meal photo to get started with AI nutrition analysis"
        action={
          <Link href="/upload">
            <Button size="sm">Scan your first meal</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {meals.map((meal, idx) => (
        <MealCard key={meal._id || meal.id || `meal-${idx}`} meal={meal} />
      ))}
    </div>
  );
});
