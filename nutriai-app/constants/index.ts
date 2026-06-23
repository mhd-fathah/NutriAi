export const ACTIVITY_LEVELS = {
  sedentary: { label: "Sedentary", multiplier: 1.2, description: "Little or no exercise" },
  lightly_active: { label: "Lightly Active", multiplier: 1.375, description: "Light exercise 1-3 days/week" },
  moderately_active: { label: "Moderately Active", multiplier: 1.55, description: "Moderate exercise 3-5 days/week" },
  very_active: { label: "Very Active", multiplier: 1.725, description: "Hard exercise 6-7 days/week" },
  extra_active: { label: "Extra Active", multiplier: 1.9, description: "Very hard exercise, physical job" },
} as const;

export const MEAL_TYPES = {
  breakfast: { label: "Breakfast", icon: "🌅", color: "#F59E0B" },
  lunch: { label: "Lunch", icon: "☀️", color: "#10B981" },
  dinner: { label: "Dinner", icon: "🌙", color: "#6366F1" },
  snacks: { label: "Snacks", icon: "🍎", color: "#EF4444" },
} as const;

export const BMI_CATEGORIES = {
  underweight: { min: 0, max: 18.5, label: "Underweight", color: "#3B82F6" },
  normal: { min: 18.5, max: 24.9, label: "Normal", color: "#10B981" },
  overweight: { min: 25, max: 29.9, label: "Overweight", color: "#F59E0B" },
  obese: { min: 30, max: Infinity, label: "Obese", color: "#EF4444" },
} as const;

export const MACRO_SPLITS = {
  protein: 0.3,
  carbs: 0.4,
  fat: 0.3,
} as const;

export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

export const DESIGN_TOKENS = {
  primary: "#10B981",
  primaryHover: "#059669",
  background: "#FFFFFF",
  cardBg: "rgba(255,255,255,0.75)",
  border: "#E5E7EB",
  text: "#111827",
  muted: "#6B7280",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
} as const;
