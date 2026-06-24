import { z } from 'zod';

export const FoodItemAnalysisSchema = z.object({
  name: z.string().default('Unknown Food'),
  portion: z.string().default('Unknown Portion'),
  estimatedWeight: z.coerce.number().min(0).default(0),
  calories: z.coerce.number().min(0).default(0),
  protein: z.coerce.number().min(0).default(0),
  carbs: z.coerce.number().min(0).default(0),
  fat: z.coerce.number().min(0).default(0),
  sugar: z.coerce.number().min(0).default(0),
  fiber: z.coerce.number().min(0).default(0),
  sodium: z.coerce.number().min(0).default(0),
});

export const MultiStageNutritionSchema = z.object({
  foods: z.array(FoodItemAnalysisSchema).default([]),
  totals: z.object({
    calories: z.coerce.number().min(0).default(0),
    protein: z.coerce.number().min(0).default(0),
    carbs: z.coerce.number().min(0).default(0),
    fat: z.coerce.number().min(0).default(0),
    sugar: z.coerce.number().min(0).default(0),
    fiber: z.coerce.number().min(0).default(0),
    sodium: z.coerce.number().min(0).default(0),
  }),
  confidence: z.coerce.number().min(0).max(100).default(80),
});

export const CoachingRecommendationSchema = z.object({
  category: z.enum([
    'Protein Boost',
    'Calorie Boost',
    'Weight Loss Tip',
    'Healthy Snack Suggestion',
    'Hydration Tip',
    'General Coaching',
  ]),
  text: z.string(),
  why: z.string(),
});

export const PersonalizedCoachingSchema = z.object({
  insights: z.array(z.string()).min(1).max(3),
});

export const NutritionTipsSchema = z.object({
  tips: z.array(z.string()).min(1).max(3),
});

export type FoodItemAnalysis = z.infer<typeof FoodItemAnalysisSchema>;
export type MultiStageNutrition = z.infer<typeof MultiStageNutritionSchema>;
export type NutritionTips = z.infer<typeof NutritionTipsSchema>;
export type CoachingRecommendation = z.infer<typeof CoachingRecommendationSchema>;
export type PersonalizedCoaching = z.infer<typeof PersonalizedCoachingSchema>;
