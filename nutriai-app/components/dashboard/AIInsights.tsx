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
