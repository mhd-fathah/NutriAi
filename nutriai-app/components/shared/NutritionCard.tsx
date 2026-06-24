import { cn, getProgressPercentage } from "@/utils";

interface NutritionCardProps {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
  icon: string;
  className?: string;
}

export default function NutritionCard({
  label,
  consumed,
  target,
  unit,
  color,
  icon,
  className,
}: NutritionCardProps) {
  const percentage = getProgressPercentage(consumed, target);

  const colorClasses: Record<string, { bar: string; text: string; bg: string }> = {
    emerald: { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
    blue: { bar: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20" },
    amber: { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20" },
    purple: { bar: "bg-purple-500", text: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/20" },
    rose: { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/20" },
  };

  const colors = colorClasses[color] || colorClasses.emerald;

  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md dark:shadow-none hover:-translate-y-0.5 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-lg", colors.bg)}>
          {icon}
        </div>
        <span className={cn("text-sm font-semibold", colors.text)}>{percentage}%</span>
      </div>
      <div className="space-y-1 mb-3">
        <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
          {Math.round(consumed)}
          <span className="text-sm font-normal text-gray-400 dark:text-zinc-500 ml-1">{unit}</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-zinc-500">
          of {Math.round(target)} {unit} goal
        </p>
      </div>
      <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", colors.bar)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
