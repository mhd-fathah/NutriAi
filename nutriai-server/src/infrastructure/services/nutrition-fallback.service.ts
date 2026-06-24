import { Injectable } from '@nestjs/common';

interface NutritionProfile {
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
}

@Injectable()
export class NutritionFallbackService {
  private readonly database: Record<string, NutritionProfile> = {
    biryani: {
      foodName: 'Chicken Biryani',
      estimatedWeight: '450g',
      calories: 900,
      protein: 35,
      carbs: 90,
      fat: 30,
      sugar: 4,
      fiber: 4,
      sodium: 900,
      foods: [
        {
          name: 'Chicken Biryani',
          portion: '1 plate',
          estimatedWeight: 450,
          calories: 900,
          protein: 35,
          carbs: 90,
          fat: 30,
          sugar: 4,
          fiber: 4,
          sodium: 900,
        },
      ],
    },
    pizza: {
      foodName: 'Cheese Pizza',
      estimatedWeight: '300g',
      calories: 800,
      protein: 30,
      carbs: 85,
      fat: 28,
      sugar: 6,
      fiber: 3,
      sodium: 1200,
      foods: [
        {
          name: 'Cheese Pizza',
          portion: '3 slices',
          estimatedWeight: 300,
          calories: 800,
          protein: 30,
          carbs: 85,
          fat: 28,
          sugar: 6,
          fiber: 3,
          sodium: 1200,
        },
      ],
    },
    burger: {
      foodName: 'Beef Burger',
      estimatedWeight: '220g',
      calories: 650,
      protein: 28,
      carbs: 45,
      fat: 32,
      sugar: 7,
      fiber: 2,
      sodium: 1000,
      foods: [
        {
          name: 'Beef Burger',
          portion: '1 burger',
          estimatedWeight: 220,
          calories: 650,
          protein: 28,
          carbs: 45,
          fat: 32,
          sugar: 7,
          fiber: 2,
          sodium: 1000,
        },
      ],
    },
    salad: {
      foodName: 'Garden Salad',
      estimatedWeight: '200g',
      calories: 250,
      protein: 10,
      carbs: 15,
      fat: 12,
      sugar: 3,
      fiber: 5,
      sodium: 400,
      foods: [
        {
          name: 'Garden Salad',
          portion: '1 bowl',
          estimatedWeight: 200,
          calories: 250,
          protein: 10,
          carbs: 15,
          fat: 12,
          sugar: 3,
          fiber: 5,
          sodium: 400,
        },
      ],
    },
    pasta: {
      foodName: 'Pasta Marinara',
      estimatedWeight: '350g',
      calories: 700,
      protein: 22,
      carbs: 80,
      fat: 20,
      sugar: 5,
      fiber: 4,
      sodium: 800,
      foods: [
        {
          name: 'Pasta Marinara',
          portion: '1 plate',
          estimatedWeight: 350,
          calories: 700,
          protein: 22,
          carbs: 80,
          fat: 20,
          sugar: 5,
          fiber: 4,
          sodium: 800,
        },
      ],
    },
    sandwich: {
      foodName: 'Turkey Sandwich',
      estimatedWeight: '180g',
      calories: 450,
      protein: 18,
      carbs: 40,
      fat: 15,
      sugar: 4,
      fiber: 3,
      sodium: 700,
      foods: [
        {
          name: 'Turkey Sandwich',
          portion: '1 sandwich',
          estimatedWeight: 180,
          calories: 450,
          protein: 18,
          carbs: 40,
          fat: 15,
          sugar: 4,
          fiber: 3,
          sodium: 700,
        },
      ],
    },
    eggs: {
      foodName: 'Scrambled Eggs',
      estimatedWeight: '150g',
      calories: 350,
      protein: 24,
      carbs: 2,
      fat: 22,
      sugar: 1,
      fiber: 0,
      sodium: 400,
      foods: [
        {
          name: 'Scrambled Eggs',
          portion: '3 eggs',
          estimatedWeight: 150,
          calories: 350,
          protein: 24,
          carbs: 2,
          fat: 22,
          sugar: 1,
          fiber: 0,
          sodium: 400,
        },
      ],
    },
    oats: {
      foodName: 'Oatmeal',
      estimatedWeight: '250g',
      calories: 300,
      protein: 10,
      carbs: 50,
      fat: 6,
      sugar: 1,
      fiber: 8,
      sodium: 100,
      foods: [
        {
          name: 'Oatmeal',
          portion: '1 bowl',
          estimatedWeight: 250,
          calories: 300,
          protein: 10,
          carbs: 50,
          fat: 6,
          sugar: 1,
          fiber: 8,
          sodium: 100,
        },
      ],
    },
  };

  private readonly mealTypeDefaults: Record<string, NutritionProfile> = {
    breakfast: {
      foodName: 'Estimated Breakfast',
      estimatedWeight: '200g',
      calories: 400,
      protein: 15,
      carbs: 50,
      fat: 12,
      sugar: 8,
      fiber: 3,
      sodium: 400,
      foods: [
        {
          name: 'Estimated Breakfast',
          portion: 'Regular',
          estimatedWeight: 200,
          calories: 400,
          protein: 15,
          carbs: 50,
          fat: 12,
          sugar: 8,
          fiber: 3,
          sodium: 400,
        },
      ],
    },
    lunch: {
      foodName: 'Estimated Lunch',
      estimatedWeight: '300g',
      calories: 700,
      protein: 25,
      carbs: 80,
      fat: 22,
      sugar: 5,
      fiber: 4,
      sodium: 700,
      foods: [
        {
          name: 'Estimated Lunch',
          portion: 'Regular',
          estimatedWeight: 300,
          calories: 700,
          protein: 25,
          carbs: 80,
          fat: 22,
          sugar: 5,
          fiber: 4,
          sodium: 700,
        },
      ],
    },
    dinner: {
      foodName: 'Estimated Dinner',
      estimatedWeight: '300g',
      calories: 700,
      protein: 25,
      carbs: 80,
      fat: 22,
      sugar: 5,
      fiber: 4,
      sodium: 700,
      foods: [
        {
          name: 'Estimated Dinner',
          portion: 'Regular',
          estimatedWeight: 300,
          calories: 700,
          protein: 25,
          carbs: 80,
          fat: 22,
          sugar: 5,
          fiber: 4,
          sodium: 700,
        },
      ],
    },
    snacks: {
      foodName: 'Estimated Snack',
      estimatedWeight: '120g',
      calories: 250,
      protein: 8,
      carbs: 30,
      fat: 10,
      sugar: 12,
      fiber: 2,
      sodium: 250,
      foods: [
        {
          name: 'Estimated Snack',
          portion: 'Regular',
          estimatedWeight: 120,
          calories: 250,
          protein: 8,
          carbs: 30,
          fat: 10,
          sugar: 12,
          fiber: 2,
          sodium: 250,
        },
      ],
    },
  };

  estimateNutrition(mealType: string, foodName?: string) {
    const query = (foodName || '').toLowerCase().trim();
    
    // Find matching profile in the database
    let profile: NutritionProfile | undefined;
    for (const key of Object.keys(this.database)) {
      if (query.includes(key)) {
        profile = this.database[key];
        break;
      }
    }

    // Fall back to meal type defaults if no specific food match is found
    if (!profile) {
      profile = this.mealTypeDefaults[mealType] || this.mealTypeDefaults.lunch;
    }

    return {
      ...profile,
      confidence: 40,
      isEstimated: true,
      aiStatus: 'fallback' as const,
      aiProvider: 'fallback' as const,
    };
  }
}
