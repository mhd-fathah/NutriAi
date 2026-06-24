export interface IDashboardRepository {
  getDashboardOverview(userId: string): Promise<{
    user: {
      name: string;
      goal: string;
      bmi: number;
      dailyCalories: number;
      dailyProtein: number;
      dailyCarbs: number;
      dailyFat: number;
    };
    todayNutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      sugar: number;
    };
    todayMeals: Array<{
      id: string;
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
      imageUrl: string;
      foodName: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      createdAt: Date;
    }>;
    weeklyAnalytics: Array<{
      date: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
    aiInsights: string[];
    summary: {
      remainingCalories: number;
      remainingProtein: number;
      remainingCarbs: number;
      remainingFat: number;
    };
  }>;
}
