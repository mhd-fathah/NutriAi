export class MealEntity {
  id: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  imageUrl: string;
  foodName: string;
  estimatedWeight: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  aiTips: string[];
  isEstimated: boolean;
  aiStatus: 'success' | 'fallback';
  aiProvider: 'gemini' | 'local';
  createdAt?: Date;

  constructor(partial: Partial<MealEntity>) {
    Object.assign(this, partial);
  }
}
