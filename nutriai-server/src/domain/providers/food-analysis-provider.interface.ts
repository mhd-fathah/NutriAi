export interface IFoodAnalysisProvider {
  analyzeFood(
    imageBase64: string,
    mimeType: string,
  ): Promise<{
    foodName: string;
    estimatedWeight: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    isEstimated: boolean;
    aiStatus: 'success' | 'fallback';
    aiProvider: 'gemini' | 'local';
  }>;

  generateNutritionTips(context: {
    goal: string;
    dailyCalories: number;
    consumedCalories: number;
    protein: number;
    carbs: number;
    fat: number;
  }): Promise<string[]>;
}
