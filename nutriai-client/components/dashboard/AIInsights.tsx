"use client";

import { memo } from "react";
import { Sparkles, Activity, Award, Flame, Apple, Heart, Droplets, Target, AlertTriangle, CheckCircle } from "lucide-react";

interface AIInsightsProps {
  tips: string[];
  hasData: boolean;
}

// ─── Legacy interface (for backwards-compat with old DB records) ───────────────
interface LegacyRecommendation {
  category: string;
  text: string;
  why: string;
}
interface LegacyCoaching {
  summary?: string;
  recommendations?: LegacyRecommendation[];
  insights?: string[];
}

// ─── Insight classification ────────────────────────────────────────────────────
interface InsightMeta {
  title: string;
  icon: React.ReactNode;
  cardClass: string;
  badgeClass: string;
  iconBgClass: string;
}

function getInsightMeta(text: string): InsightMeta {
  const lower = text.toLowerCase();

  if (lower.includes("calorie") || lower.includes("kcal") || lower.includes("energy")) {
    const isOver = lower.includes("above") || lower.includes("over") || lower.includes("excess") || lower.includes("+");
    return {
      title: isOver ? "Calorie Alert" : "Calorie Goal",
      icon: <Flame className="w-4 h-4" />,
      cardClass: "border-amber-200/60 dark:border-amber-800/30 bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10",
      badgeClass: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
      iconBgClass: "bg-amber-500",
    };
  }

  if (lower.includes("protein") || lower.includes("chicken") || lower.includes("egg") || lower.includes("yogurt") || lower.includes("meat")) {
    return {
      title: "Protein Intake",
      icon: <Award className="w-4 h-4" />,
      cardClass: "border-purple-200/60 dark:border-purple-800/30 bg-gradient-to-br from-purple-50/80 to-violet-50/40 dark:from-purple-950/20 dark:to-violet-950/10",
      badgeClass: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400",
      iconBgClass: "bg-purple-500",
    };
  }

  if (lower.includes("water") || lower.includes("hydrat") || lower.includes("drink") || lower.includes("fluid") || lower.includes("💧")) {
    return {
      title: "Hydration",
      icon: <Droplets className="w-4 h-4" />,
      cardClass: "border-blue-200/60 dark:border-blue-800/30 bg-gradient-to-br from-blue-50/80 to-sky-50/40 dark:from-blue-950/20 dark:to-sky-950/10",
      badgeClass: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
      iconBgClass: "bg-blue-500",
    };
  }

  if (lower.includes("fat") || lower.includes("fried") || lower.includes("oily") || lower.includes("greasy")) {
    return {
      title: "Fat Intake",
      icon: <Activity className="w-4 h-4" />,
      cardClass: "border-rose-200/60 dark:border-rose-800/30 bg-gradient-to-br from-rose-50/80 to-pink-50/40 dark:from-rose-950/20 dark:to-pink-950/10",
      badgeClass: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400",
      iconBgClass: "bg-rose-500",
    };
  }

  if (lower.includes("carb") || lower.includes("bread") || lower.includes("rice") || lower.includes("sugar") || lower.includes("sweet")) {
    return {
      title: "Carb & Sugar",
      icon: <Apple className="w-4 h-4" />,
      cardClass: "border-teal-200/60 dark:border-teal-800/30 bg-gradient-to-br from-teal-50/80 to-emerald-50/40 dark:from-teal-950/20 dark:to-emerald-950/10",
      badgeClass: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400",
      iconBgClass: "bg-teal-500",
    };
  }

  if (lower.includes("goal") || lower.includes("target") || lower.includes("progress") || lower.includes("🎯")) {
    return {
      title: "Goal Progress",
      icon: <Target className="w-4 h-4" />,
      cardClass: "border-indigo-200/60 dark:border-indigo-800/30 bg-gradient-to-br from-indigo-50/80 to-blue-50/40 dark:from-indigo-950/20 dark:to-blue-950/10",
      badgeClass: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400",
      iconBgClass: "bg-indigo-500",
    };
  }

  // Default: general coaching
  return {
    title: "Coach Tip",
    icon: <Heart className="w-4 h-4" />,
    cardClass: "border-emerald-200/60 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/80 to-green-50/40 dark:from-emerald-950/20 dark:to-green-950/10",
    badgeClass: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
    iconBgClass: "bg-emerald-500",
  };
}

// ─── Strip leading emoji for cleaner text display ─────────────────────────────
function stripLeadingEmoji(text: string): string {
  return text.replace(/^[\p{Emoji}\s]+/u, "").trim();
}

// ─── Extract leading emoji ────────────────────────────────────────────────────
function extractEmoji(text: string): string {
  const match = text.match(/^[\p{Emoji}]+/u);
  return match ? match[0] : "";
}

// ─── Parse tips: handles new string[], legacy JSON, and plain text ────────────
function parseTips(tips: string[]): string[] {
  if (!tips || tips.length === 0) return [];

  // Try legacy JSON format (first element is a JSON stringified object)
  if (tips.length === 1 && tips[0].startsWith("{")) {
    try {
      const legacy = JSON.parse(tips[0]) as LegacyCoaching;
      if (legacy.insights && legacy.insights.length > 0) return legacy.insights;
      if (legacy.recommendations && legacy.recommendations.length > 0) {
        return legacy.recommendations.map((r) => `${r.text}`);
      }
    } catch {
      // fall through
    }
  }

  return tips;
}

// ─── Placeholder cards for no-data state ─────────────────────────────────────
const placeholders = [
  { emoji: "📸", title: "Scan Your Meal", text: "Upload a food photo to get your first personalized AI insight." },
  { emoji: "📊", title: "Track Macros", text: "Log consistently to see how your intake compares to your daily targets." },
  { emoji: "🎯", title: "Hit Your Goal", text: "Unlock weekly nutrition trends after tracking 3+ meals." },
];

// ─── Component ────────────────────────────────────────────────────────────────
function AIInsights({ tips, hasData }: AIInsightsProps) {
  if (!hasData || !tips || tips.length === 0) {
    return (
      <div className="space-y-3">
        {placeholders.map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 p-4 rounded-2xl border border-emerald-100/60 dark:border-emerald-900/20 bg-gradient-to-r from-emerald-50/60 to-teal-50/30 dark:from-emerald-950/15 dark:to-teal-950/10 transition-all duration-200 hover:border-emerald-200 dark:hover:border-emerald-800/40"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 text-base shadow-sm">
              {p.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-0.5">{p.title}</p>
              <p className="text-sm text-gray-600 dark:text-zinc-400 leading-snug">{p.text}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const insights = parseTips(tips);

  return (
    <div className="space-y-3">
      {insights.slice(0, 3).map((insight, i) => {
        const meta = getInsightMeta(insight);
        const emoji = extractEmoji(insight);
        const text = stripLeadingEmoji(insight);

        return (
          <div
            key={i}
            className={`group flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-sm ${meta.cardClass}`}
          >
            {/* Icon */}
            <div className={`w-9 h-9 rounded-xl ${meta.iconBgClass} flex items-center justify-center flex-shrink-0 text-white shadow-sm`}>
              {emoji ? (
                <span className="text-base leading-none">{emoji}</span>
              ) : (
                meta.icon
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
                  {meta.icon}
                  {meta.title}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200 leading-snug">
                {text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(AIInsights);
