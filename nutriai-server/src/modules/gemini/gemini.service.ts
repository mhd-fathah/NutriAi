import { Injectable, Inject } from '@nestjs/common';
import type { IFoodAnalysisProvider } from '../../domain/providers/food-analysis-provider.interface';

@Injectable()
export class GeminiService {
  constructor(
    @Inject('IFoodAnalysisProvider')
    private readonly foodAnalysisProvider: IFoodAnalysisProvider,
  ) {}

  async analyzeFood(
    imageBase64: string,
    mimeType: string = 'image/jpeg',
  ) {
    return this.foodAnalysisProvider.analyzeFood(imageBase64, mimeType);
  }

  async generateNutritionTips(context: {
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
  }): Promise<string[]> {
    return this.foodAnalysisProvider.generateNutritionTips(context);
  }
}
