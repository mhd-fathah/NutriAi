import { Sparkles } from "lucide-react";

interface AIInsightsProps {
  tips: string[];
  hasData: boolean;
}

const defaultTips = [
  "Log your first meal to get personalized AI nutrition insights.",
  "Upload a photo of your food for instant calorie and macro analysis.",
  "Track consistently to unlock your weekly nutrition trends.",
];

export default function AIInsights({ tips, hasData }: AIInsightsProps) {
  const displayTips = hasData && tips.length > 0 ? tips : defaultTips;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-emerald-600" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">AI Nutrition Coach</h2>
        {!hasData && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            Log a meal first
          </span>
        )}
      </div>
      <div className="space-y-2.5">
        {displayTips.map((tip, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
