import { GeminiNutritionResponse } from "@/types";

export interface NutritionAnalysis {
  foodName: string;
  estimatedWeight: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  isEstimated: boolean;
  aiStatus: "success" | "fallback";
  aiProvider: "gemini" | "local";
}

export interface AIFoodRecognitionService {
  analyzeFood(
    imageBase64: string,
    mimeType?: string
  ): Promise<NutritionAnalysis>;
}