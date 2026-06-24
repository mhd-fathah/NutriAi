import { memo } from "react";
import { Sparkles, Activity, Award, Flame, Apple, Heart, Droplets } from "lucide-react";

interface CoachingRecommendation {
  category: string;
  text: string;
  why: string;
}

interface PersonalizedCoaching {
  summary: string;
  recommendations: CoachingRecommendation[];
}

interface AIInsightsProps {
  tips: string[];
  hasData: boolean;
}

const defaultTips = [
  "Log your first meal to get personalized AI nutrition insights.",
  "Upload a photo of your food for instant calorie and macro analysis.",
  "Track consistently to unlock your weekly nutrition trends.",
];

const getCategoryStyles = (category: string) => {
  switch (category) {
    case "Protein Boost":
      return {
        bg: "bg-purple-55 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
        icon: <Award className="w-3.5 h-3.5" />,
      };
    case "Calorie Boost":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
        icon: <Flame className="w-3.5 h-3.5" />,
      };
    case "Weight Loss Tip":
      return {
        bg: "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
        icon: <Activity className="w-3.5 h-3.5" />,
      };
    case "Healthy Snack Suggestion":
      return {
        bg: "bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border-teal-100 dark:border-teal-900/30",
        icon: <Apple className="w-3.5 h-3.5" />,
      };
    case "Hydration Tip":
      return {
        bg: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
        icon: <Droplets className="w-3.5 h-3.5" />,
      };
    default:
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
        icon: <Heart className="w-3.5 h-3.5" />,
      };
  }
};

function AIInsights({ tips, hasData }: AIInsightsProps) {
  if (!hasData || tips.length === 0) {
    return (
      <div className="space-y-2.5">
        {defaultTips.map((tip, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    );
  }

  // Check if first tip contains serialized structured output
  let parsedCoaching: PersonalizedCoaching | null = null;
  try {
    if (tips[0]?.startsWith("{")) {
      parsedCoaching = JSON.parse(tips[0]);
    }
  } catch (e) {
    console.error("Failed to parse AI insights JSON", e);
  }

  if (parsedCoaching) {
    return (
      <div className="space-y-4">
        {/* SUMMARY CARD */}
        <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/40 dark:border-emerald-900/10">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-350 flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
            <span>{parsedCoaching.summary}</span>
          </p>
        </div>

        {/* RECOMMENDATION LIST */}
        <div className="space-y-3">
          {parsedCoaching.recommendations.map((rec, i) => {
            const styles = getCategoryStyles(rec.category);
            return (
              <div
                key={i}
                className="p-4 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-100 dark:border-zinc-800/80 rounded-2xl hover:border-gray-250 dark:hover:border-zinc-700 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${styles.bg}`}>
                    {styles.icon}
                    {rec.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200 mb-1">{rec.text}</h4>
                <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed font-medium">{rec.why}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback for unstructured legacy tips
  return (
    <div className="space-y-2.5">
      {tips.map((tip, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{tip}</p>
        </div>
      ))}
    </div>
  );
}

export default memo(AIInsights);
