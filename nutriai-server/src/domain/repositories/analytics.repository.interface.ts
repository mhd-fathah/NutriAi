export interface IAnalyticsRepository {
  getDailyStatsForRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ date: string; calories: number; protein: number; carbs: number; fat: number }>>;

  getNutritionTotalsForRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ calories: number; protein: number; carbs: number; fat: number; sugar: number; fiber: number; sodium: number }>;

  getMealDatesDescending(userId: string): Promise<Date[]>;
}
