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
    emerald: { bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" },
    blue: { bar: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50" },
    amber: { bar: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50" },
    purple: { bar: "bg-purple-500", text: "text-purple-600", bg: "bg-purple-50" },
    rose: { bar: "bg-rose-500", text: "text-rose-600", bg: "bg-rose-50" },
  };

  const colors = colorClasses[color] || colorClasses.emerald;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200",
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
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900">
          {Math.round(consumed)}
          <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
        </p>
        <p className="text-xs text-gray-400">
          of {Math.round(target)} {unit} goal
        </p>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", colors.bar)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
