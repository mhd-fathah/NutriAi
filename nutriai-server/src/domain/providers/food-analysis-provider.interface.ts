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
    fiber: number;
    sodium: number;
    foods: Array<{
      name: string;
      portion: string;
      estimatedWeight: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      sugar: number;
      fiber: number;
      sodium: number;
    }>;
    confidence: number;
    isEstimated: boolean;
    aiStatus: 'success' | 'fallback';
    aiProvider: 'gemini' | 'local';
  }>;

  generateNutritionTips(context: {
    user: {
      age?: number;
      gender?: string;
      weight?: number;
      height?: number;
      goal: string;
      dailyCalories: number;
      dailyProtein: number;
      dailyCarbs: number;
      dailyFat: number;
    };
    todayConsumption: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      sugar: number;
    };
    mealHistory: Array<{
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
      foodName: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
  }): Promise<string[]>;
}
