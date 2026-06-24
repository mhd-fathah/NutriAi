import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IFoodAnalysisProvider } from '../../domain/providers/food-analysis-provider.interface';
import { retryWithBackoff } from '../../common/utils/retry.util';
import { extractJSON } from '../../common/utils/json-extraction.util';
import {
  MultiStageNutritionSchema,
  NutritionTipsSchema,
  MultiStageNutrition,
  NutritionTips,
} from '../../common/validation/gemini.schemas';

const NUTRITION_PROMPT = `You are an expert nutritionist and food analyst. Analyze this food image carefully.
Tasks:
1. Identify every visible food item.
2. Estimate realistic serving sizes.
3. Estimate weight in grams.
4. Calculate nutrition values (calories, protein, carbs, fat, sugar, fiber, sodium) for each food.
5. Calculate total nutrition values.
6. Assign a confidence score (0-100) based on image clarity and visibility.

Be conservative. Do not exaggerate calories. Do not invent foods not visible in the image.`;

const NUTRITION_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    foods: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          portion: { type: 'string' },
          estimatedWeight: { type: 'number' },
          calories: { type: 'number' },
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fat: { type: 'number' },
          sugar: { type: 'number' },
          fiber: { type: 'number' },
          sodium: { type: 'number' },
        },
        required: ['name', 'portion', 'estimatedWeight', 'calories', 'protein', 'carbs', 'fat', 'sugar', 'fiber', 'sodium'],
      },
    },
    totals: {
      type: 'object',
      properties: {
        calories: { type: 'number' },
        protein: { type: 'number' },
        carbs: { type: 'number' },
        fat: { type: 'number' },
        sugar: { type: 'number' },
        fiber: { type: 'number' },
        sodium: { type: 'number' },
      },
      required: ['calories', 'protein', 'carbs', 'fat', 'sugar', 'fiber', 'sodium'],
    },
    confidence: { type: 'number' },
  },
  required: ['foods', 'totals', 'confidence'],
};

const TIPS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    tips: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['tips'],
};

@Injectable()
export class GeminiFoodAnalysisProvider implements IFoodAnalysisProvider {
  private readonly logger = new Logger(GeminiFoodAnalysisProvider.name);
  private genAI: GoogleGenerativeAI | null = null;
  private readonly primaryModel = 'gemini-2.5-flash';
  private readonly fallbackModel = 'gemini-2.0-flash';

  private getGenAI(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not defined.');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  private validateAndSanitize(parsedObj: any): MultiStageNutrition {
    const validated = MultiStageNutritionSchema.parse(parsedObj);

    // Validate realistic limits for each food item
    validated.foods = validated.foods.map((item) => {
      const weight = item.estimatedWeight || 100;
      
      let protein = Math.max(0, item.protein);
      let carbs = Math.max(0, item.carbs);
      let fat = Math.max(0, item.fat);
      let sugar = Math.max(0, item.sugar);
      let fiber = Math.max(0, item.fiber);

      const totalMacros = protein + carbs + fat;
      if (totalMacros > weight) {
        const scale = weight / totalMacros;
        protein = Math.round(protein * scale * 10) / 10;
        carbs = Math.round(carbs * scale * 10) / 10;
        fat = Math.round(fat * scale * 10) / 10;
      }

      if (sugar > carbs) {
        sugar = carbs;
      }

      if (fiber > carbs) {
        fiber = carbs;
      }

      return {
        ...item,
        protein,
        carbs,
        fat,
        sugar,
        fiber,
      };
    });

    // Ensure totals represent the sum of food items
    const calculatedTotals = validated.foods.reduce(
      (acc, item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
        acc.sugar += item.sugar;
        acc.fiber += item.fiber;
        acc.sodium += item.sodium;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0, sodium: 0 },
    );

    if (validated.totals.calories <= 0 && calculatedTotals.calories > 0) {
      validated.totals = calculatedTotals;
    }

    return validated;
  }

  private cleanAndParseJSON(text: string): MultiStageNutrition {
    const parsedObj = extractJSON(text);
    return this.validateAndSanitize(parsedObj);
  }

  private async callGeminiModel(
    modelName: string,
    imageBase64: string,
    mimeType: string,
  ): Promise<MultiStageNutrition> {
    const genAI = this.getGenAI();
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: NUTRITION_RESPONSE_SCHEMA as any,
      },
    });

    const result = await model.generateContent([
      NUTRITION_PROMPT,
      { inlineData: { data: imageBase64, mimeType } },
    ]);

    const text = result.response.text();
    return this.cleanAndParseJSON(text);
  }

  async analyzeFood(
    imageBase64: string,
    mimeType: string = 'image/jpeg',
  ) {
    const retryOptions = {
      maxAttempts: 3,
      initialDelayMs: 2000,
      maxDelayMs: 15000,
      backoffFactor: 2.5,
      useJitter: true,
    };

    // 1. Try Primary Model
    try {
      this.logger.log(`Analyzing food with primary model: ${this.primaryModel}`);
      const data = await retryWithBackoff(
        () => this.callGeminiModel(this.primaryModel, imageBase64, mimeType),
        retryOptions,
        this.logger,
        'GeminiPrimaryFoodAnalysis',
      );

      const foodName = data.foods.map((f) => f.name).join(', ') || 'Unknown Food';
      const totalWeight = data.foods.reduce((acc, f) => acc + f.estimatedWeight, 0);

      return {
        foodName,
        estimatedWeight: `${totalWeight}g`,
        calories: data.totals.calories,
        protein: data.totals.protein,
        carbs: data.totals.carbs,
        fat: data.totals.fat,
        sugar: data.totals.sugar,
        fiber: data.totals.fiber,
        sodium: data.totals.sodium,
        foods: data.foods,
        confidence: data.confidence,
        isEstimated: false,
        aiStatus: 'success' as const,
        aiProvider: 'gemini' as const,
      };
    } catch (primaryErr) {
      this.logger.error(`Primary model analysis failed: ${primaryErr.message}`);
    }

    // 2. Try Fallback Model
    try {
      this.logger.warn(`Switching to fallback model: ${this.fallbackModel}`);
      const data = await retryWithBackoff(
        () => this.callGeminiModel(this.fallbackModel, imageBase64, mimeType),
        retryOptions,
        this.logger,
        'GeminiFallbackFoodAnalysis',
      );

      const foodName = data.foods.map((f) => f.name).join(', ') || 'Unknown Food';
      const totalWeight = data.foods.reduce((acc, f) => acc + f.estimatedWeight, 0);

      return {
        foodName,
        estimatedWeight: `${totalWeight}g`,
        calories: data.totals.calories,
        protein: data.totals.protein,
        carbs: data.totals.carbs,
        fat: data.totals.fat,
        sugar: data.totals.sugar,
        fiber: data.totals.fiber,
        sodium: data.totals.sodium,
        foods: data.foods,
        confidence: data.confidence,
        isEstimated: false,
        aiStatus: 'success' as const,
        aiProvider: 'gemini' as const,
      };
    } catch (fallbackErr) {
      this.logger.error(`Fallback model analysis failed: ${fallbackErr.message}`);
    }

    // 3. Fallback to Local Estimates
    this.logger.warn('All Gemini attempts failed. Returning estimated values.');
    return {
      foodName: 'Estimated Meal',
      estimatedWeight: '250g',
      calories: 500,
      protein: 20,
      carbs: 60,
      fat: 15,
      sugar: 5,
      fiber: 4,
      sodium: 600,
      foods: [
        {
          name: 'Estimated Meal',
          portion: 'Regular',
          estimatedWeight: 250,
          calories: 500,
          protein: 20,
          carbs: 60,
          fat: 15,
          sugar: 5,
          fiber: 4,
          sodium: 600,
        },
      ],
      confidence: 50,
      isEstimated: true,
      aiStatus: 'fallback' as const,
      aiProvider: 'local' as const,
    };
  }

  async generateNutritionTips(context: {
    goal: string;
    dailyCalories: number;
    consumedCalories: number;
    protein: number;
    carbs: number;
    fat: number;
  }): Promise<string[]> {
    const goalLabels: Record<string, string> = {
      lose_weight: 'Lose Weight',
      maintain_weight: 'Maintain Weight',
      gain_weight: 'Gain Weight',
    };

    const prompt = `You are a professional nutrition coach. Based on the user's data below, provide exactly 3 short, actionable nutrition recommendations.

User Goal: ${goalLabels[context.goal] || context.goal}
Target Calories: ${context.dailyCalories} kcal
Consumed Today: ${context.consumedCalories} kcal
Remaining: ${context.dailyCalories - context.consumedCalories} kcal
Protein Today: ${context.protein}g
Carbs Today: ${context.carbs}g
Fat Today: ${context.fat}g`;

    const retryOptions = {
      maxAttempts: 2,
      initialDelayMs: 2000,
      maxDelayMs: 8000,
      backoffFactor: 2,
      useJitter: true,
    };

    const modelsToTry = [this.primaryModel, this.fallbackModel];

    for (const modelName of modelsToTry) {
      try {
        this.logger.log(`Generating tips with model: ${modelName}`);
        const result = await retryWithBackoff(
          async () => {
            const genAI = this.getGenAI();
            const model = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: TIPS_RESPONSE_SCHEMA as any,
              },
            });
            const res = await model.generateContent(prompt);
            const text = res.response.text();
            const parsed = extractJSON<any>(text);
            const validated = NutritionTipsSchema.parse(parsed);
            return validated.tips;
          },
          retryOptions,
          this.logger,
          `GeminiTipsGeneration-${modelName}`,
        );

        if (result && Array.isArray(result) && result.length > 0) {
          return result.slice(0, 3);
        }
      } catch (e) {
        this.logger.error(`Tips generation with ${modelName} failed: ${e.message}`);
      }
    }

    return [
      'Track your meals consistently for better insights.',
      'Aim to drink at least 8 glasses of water today.',
      'Include a variety of protein sources in your diet.',
    ];
  }
}
