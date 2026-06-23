import Image from "next/image";
import { formatTime } from "@/utils";
import { MealRecord } from "@/types";
import { MEAL_TYPES } from "@/constants";
import EmptyState from "@/components/shared/EmptyState";
import Link from "next/link";
import Button from "@/components/shared/Button";

export function MealCard({ meal }: { meal: MealRecord }) {
  const mealInfo = MEAL_TYPES[meal.mealType];

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-all duration-200">
      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        <Image
          src={meal.imageUrl ? meal.imageUrl : "/images/food-placeholder.jpg"}
          alt={meal.foodName}
          fill
          className="object-cover"
          sizes="56px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {mealInfo?.icon} {mealInfo?.label}
          </span>
          <span className="text-xs text-gray-400">{formatTime(meal.createdAt)}</span>
        </div>
        <p className="font-semibold text-gray-900 text-sm truncate">{meal.foodName}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-emerald-600 font-medium">{meal.calories} kcal</span>
          <span className="text-xs text-gray-400">P: {meal.protein}g</span>
          <span className="text-xs text-gray-400">C: {meal.carbs}g</span>
          <span className="text-xs text-gray-400">F: {meal.fat}g</span>
        </div>
      </div>
    </div>
  );
}

export function TodayMealsList({ meals }: { meals: MealRecord[] }) {
  if (meals.length === 0) {
    return (
      <EmptyState
        icon="🍽️"
        title="No meals logged today"
        description="Upload a meal photo to get started with AI nutrition analysis"
        action={
          <Link href="/upload">
            <Button size="sm">Log your first meal</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {meals.map((meal) => (
        <MealCard key={meal._id} meal={meal} />
      ))}
    </div>
  );
}
