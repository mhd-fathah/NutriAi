"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OnboardingSchema, OnboardingInput } from "@/lib/validations";
import { completeOnboarding } from "@/actions/onboarding.actions";
import { calculateAllNutritionGoals } from "@/lib/calculations/nutrition";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Select from "@/components/shared/Select";
import { ACTIVITY_LEVELS } from "@/constants";
import { cn } from "@/utils";

const activityOptions = Object.entries(ACTIVITY_LEVELS).map(([value, { label, description }]) => ({
  value,
  label: `${label} — ${description}`,
}));

const goalLabels: Record<string, { label: string; color: string; icon: string }> = {
  lose_weight: { label: "Lose Weight", color: "text-red-600 bg-red-50", icon: "📉" },
  maintain_weight: { label: "Maintain Weight", color: "text-emerald-600 bg-emerald-50", icon: "⚖️" },
  gain_weight: { label: "Gain Weight", color: "text-blue-600 bg-blue-50", icon: "📈" },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ReturnType<typeof calculateAllNutritionGoals> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(OnboardingSchema),
  });

  const watchedValues = watch();

  const handlePreview = () => {
    const { age, gender, height, weight, activityLevel } = watchedValues;
    if (age && gender && height && weight && activityLevel) {
      try {
        const goals = calculateAllNutritionGoals(
          Number(weight),
          Number(height),
          Number(age),
          gender,
          activityLevel
        );
        setPreview(goals);
      } catch {
        setPreview(null);
      }
    }
  };

  const onSubmit = async (data: OnboardingInput) => {
    setLoading(true);
    try {
      const result = await completeOnboarding(data);
      if (result.success) {
        toast.success("Profile saved! Let's start tracking.");
        router.refresh();
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Failed to save profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const goalInfo = preview ? goalLabels[preview.goal] : null;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up pb-10 space-y-8">
      {/* SECTION 1: WELCOME HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/10 bg-gradient-to-br from-emerald-950 via-slate-900 to-black p-6 md:p-8 shadow-xl shadow-emerald-500/5">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="relative space-y-3">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-xl backdrop-blur-md">
            🎯
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome to NutriAI
          </h1>
          <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
            Let&apos;s personalize your nutrition journey. Tell us a little about yourself and we&apos;ll create a custom, science-backed nutrition plan tailored to your profile.
          </p>
        </div>
      </div>

      {/* SECTION 2: ONBOARDING PROGRESS */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xl shadow-gray-100/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Profile Setup</span>
          <span className="text-xs font-bold text-gray-500">Step 1 of 1 (100%)</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full w-full transition-all duration-500" />
        </div>
      </div>

      {/* SECTION 3: FORM CARD */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 mb-1">
                <span>🎂</span>
                <span>Age</span>
              </div>
              <Input
                id="age"
                type="number"
                placeholder="25"
                error={errors.age?.message}
                {...register("age", { valueAsNumber: true })}
                onChange={(e) => {
                  register("age", { valueAsNumber: true }).onChange(e);
                  setTimeout(handlePreview, 100);
                }}
              />
              <p className="text-[11px] text-gray-400">Used to calculate your daily metabolic rate.</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 mb-1">
                <span>👤</span>
                <span>Gender</span>
              </div>
              <Select
                id="gender"
                placeholder="Select gender"
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                ]}
                error={errors.gender?.message}
                {...register("gender")}
                onChange={(e) => {
                  register("gender").onChange(e);
                  setTimeout(handlePreview, 100);
                }}
              />
              <p className="text-[11px] text-gray-400">Required for accurate BMR calculations.</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 mb-1">
                <span>📏</span>
                <span>Height (cm)</span>
              </div>
              <Input
                id="height"
                type="number"
                placeholder="175"
                error={errors.height?.message}
                {...register("height", { valueAsNumber: true })}
                onChange={(e) => {
                  register("height", { valueAsNumber: true }).onChange(e);
                  setTimeout(handlePreview, 100);
                }}
              />
              <p className="text-[11px] text-gray-400">Enter your height in centimeters.</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 mb-1">
                <span>⚖️</span>
                <span>Weight (kg)</span>
              </div>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                error={errors.weight?.message}
                {...register("weight", { valueAsNumber: true })}
                onChange={(e) => {
                  register("weight", { valueAsNumber: true }).onChange(e);
                  setTimeout(handlePreview, 100);
                }}
              />
              <p className="text-[11px] text-gray-400">Enter your current body weight.</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 mb-1">
              <span>🏃</span>
              <span>Activity Level</span>
            </div>
            <Select
              id="activityLevel"
              placeholder="Select your activity level"
              options={activityOptions}
              error={errors.activityLevel?.message}
              {...register("activityLevel")}
              onChange={(e) => {
                register("activityLevel").onChange(e);
                setTimeout(handlePreview, 100);
              }}
            />
            <p className="text-[11px] text-gray-400">Helps determine active energy expenditure.</p>
          </div>

          {/* SECTION 4 & 5: LIVE HEALTH ANALYSIS + NUTRITION GOALS */}
          {preview && goalInfo && (
            <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-3xl border border-emerald-100 p-6 space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100/50">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">AI Health Analysis</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{goalInfo.icon}</span>
                    <span className={cn("text-base font-bold px-3 py-0.5 rounded-full", goalInfo.color)}>
                      {goalInfo.label}
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-emerald-100/60 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-6 self-start sm:self-auto shadow-sm">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">BMI Index</p>
                    <p className="text-xl font-extrabold text-gray-900">{preview.bmi}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    {Number(preview.bmi) < 18.5 ? "Underweight" : Number(preview.bmi) < 25 ? "Healthy Range" : Number(preview.bmi) < 30 ? "Overweight" : "Obese"}
                  </span>
                </div>
              </div>

              {/* SECTION 5: NUTRITION GOALS */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Calculated Nutrition Goals</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Calories", value: `${preview.dailyCalories}`, unit: "kcal", color: "rose", bg: "bg-rose-50/50" },
                    { label: "Protein", value: `${preview.dailyProtein}`, unit: "g", color: "emerald", bg: "bg-emerald-50/50" },
                    { label: "Carbs", value: `${preview.dailyCarbs}`, unit: "g", color: "blue", bg: "bg-blue-50/50" },
                    { label: "Fat", value: `${preview.dailyFat}`, unit: "g", color: "amber", bg: "bg-amber-50/50" },
                  ].map(({ label, value, unit, bg }) => (
                    <div key={label} className={cn("rounded-2xl p-4 text-center border border-gray-100 shadow-sm bg-white hover:-translate-y-0.5 transition-all duration-200")}>
                      <p className="text-xs text-gray-400 font-semibold mb-0.5 uppercase tracking-wider">{label}</p>
                      <p className="text-2xl font-black text-gray-900">{value}</p>
                      <p className="text-[10px] font-semibold text-gray-400">{unit}/day</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: AI RECOMMENDATION INFO SECTION */}
          <div className="bg-emerald-500/[0.02] border border-dashed border-emerald-500/20 rounded-3xl p-5 flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              ✨
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900">Personalized AI Recommendation</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Based on your metabolic profile, we will automatically customize your daily calories and target macros to align with your health objectives.
              </p>
            </div>
          </div>

          {/* SECTION 7: SAVE BUTTON */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-base font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200" 
            size="lg" 
            loading={loading}
          >
            Start My Nutrition Journey
          </Button>
        </form>
      </div>
    </div>
  );
}
