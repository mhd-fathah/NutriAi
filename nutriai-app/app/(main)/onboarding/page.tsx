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
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8 text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎯</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Set up your profile</h1>
        <p className="text-gray-500 mt-2">
          Tell us about yourself so we can calculate your perfect nutrition goals
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="age"
              type="number"
              label="Age"
              placeholder="25"
              error={errors.age?.message}
              {...register("age", { valueAsNumber: true })}
              onChange={(e) => {
                register("age", { valueAsNumber: true }).onChange(e);
                setTimeout(handlePreview, 100);
              }}
            />

            <Select
              id="gender"
              label="Gender"
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

            <Input
              id="height"
              type="number"
              label="Height (cm)"
              placeholder="175"
              error={errors.height?.message}
              {...register("height", { valueAsNumber: true })}
              onChange={(e) => {
                register("height", { valueAsNumber: true }).onChange(e);
                setTimeout(handlePreview, 100);
              }}
            />

            <Input
              id="weight"
              type="number"
              label="Weight (kg)"
              placeholder="70"
              error={errors.weight?.message}
              {...register("weight", { valueAsNumber: true })}
              onChange={(e) => {
                register("weight", { valueAsNumber: true }).onChange(e);
                setTimeout(handlePreview, 100);
              }}
            />
          </div>

          <Select
            id="activityLevel"
            label="Activity Level"
            placeholder="Select your activity level"
            options={activityOptions}
            error={errors.activityLevel?.message}
            {...register("activityLevel")}
            onChange={(e) => {
              register("activityLevel").onChange(e);
              setTimeout(handlePreview, 100);
            }}
          />

          {/* Preview Card */}
          {preview && goalInfo && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{goalInfo.icon}</span>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Your Goal</p>
                  <span className={`inline-block text-sm font-semibold px-2.5 py-0.5 rounded-lg ${goalInfo.color}`}>
                    {goalInfo.label}
                  </span>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-gray-500">BMI</p>
                  <p className="text-lg font-bold text-gray-900">{preview.bmi}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Calories", value: `${preview.dailyCalories}`, unit: "kcal" },
                  { label: "Protein", value: `${preview.dailyProtein}`, unit: "g" },
                  { label: "Carbs", value: `${preview.dailyCarbs}`, unit: "g" },
                  { label: "Fat", value: `${preview.dailyFat}`, unit: "g" },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-400">{unit}/day</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Save profile & continue
          </Button>
        </form>
      </div>
    </div>
  );
}
