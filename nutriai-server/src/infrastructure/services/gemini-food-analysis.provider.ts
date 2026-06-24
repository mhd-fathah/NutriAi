import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { IFoodAnalysisProvider } from '../../domain/providers/food-analysis-provider.interface';

const NUTRITION_PROMPT = `Analyze this food image.
Identify all visible foods.
Estimate realistic nutrition values.
Return ONLY valid JSON.

{
  "foodName": "",
  "estimatedWeight": 0,
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "sugar": 0
}

No markdown.
No explanation.
JSON only.`;

const NutritionAnalysisSchema = z.object({
  foodName: z.string().default('Unknown Food'),
  estimatedWeight: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === 'number') return `${val}g`;
      return val || 'Unknown';
    })
    .default('Unknown'),
  calories: z.coerce.number().default(0),
  protein: z.coerce.number().default(0),
  carbs: z.coerce.number().default(0),
  fat: z.coerce.number().default(0),
  sugar: z.coerce.number().default(0),
});

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

  private safeParseJSON<T>(text: string): T | null {
    try {
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }

  private cleanAndParseJSON(text: string) {
    let cleaned = text.trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    const parsedObj = this.safeParseJSON<any>(cleaned);
    if (!parsedObj) {
      throw new Error('JSON parsing failed');
    }

    const validated = NutritionAnalysisSchema.safeParse(parsedObj);
    if (!validated.success) {
      throw new Error(validated.error.message);
    }

    return {
      foodName: validated.data.foodName,
      estimatedWeight: validated.data.estimatedWeight,
      calories: validated.data.calories,
      protein: validated.data.protein,
      carbs: validated.data.carbs,
      fat: validated.data.fat,
      sugar: validated.data.sugar,
    };
  }

  private async callGeminiModel(
    modelName: string,
    imageBase64: string,
    mimeType: string,
  ) {
    const genAI = this.getGenAI();
    const model = genAI.getGenerativeModel({ model: modelName });
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
    const primaryRetries = 3;
    const delays = [2000, 5000, 10000];

    for (let attempt = 0; attempt <= primaryRetries; attempt++) {
      try {
        if (attempt > 0) {
          this.logger.warn(
            `Retrying Primary Gemini attempt ${attempt} after ${delays[attempt - 1]}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delays[attempt - 1]));
        }

        const data = await this.callGeminiModel(
          this.primaryModel,
          imageBase64,
          mimeType,
        );

        return {
          ...data,
          isEstimated: false,
          aiStatus: 'success' as const,
          aiProvider: 'gemini' as const,
        };
      } catch (err) {
        this.logger.warn(`Primary model attempt ${attempt} failed: ${err.message}`);
      }
    }

    try {
      this.logger.warn(`Switching to Fallback Model: ${this.fallbackModel}`);
      const data = await this.callGeminiModel(
        this.fallbackModel,
        imageBase64,
        mimeType,
      );

      return {
        ...data,
        isEstimated: false,
        aiStatus: 'success' as const,
        aiProvider: 'gemini' as const,
      };
    } catch (err) {
      this.logger.warn(`Fallback Model ${this.fallbackModel} failed: ${err.message}`);
    }

    this.logger.warn('All Gemini attempts failed. Returning estimated values.');
    return {
      foodName: 'Estimated Meal',
      estimatedWeight: '250g',
      calories: 500,
      protein: 20,
      carbs: 60,
      fat: 15,
      sugar: 5,
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
Fat Today: ${context.fat}g

Return ONLY this JSON format, no markdown, no explanation:
{"tips": ["tip 1", "tip 2", "tip 3"]}`;

    const modelsToTry = [this.primaryModel, this.fallbackModel];
    const delays = [2000, 5000];

    for (const modelName of modelsToTry) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) {
            this.logger.warn(
              `Retrying tips generation with ${modelName} attempt ${attempt} after ${delays[attempt - 1]}ms...`,
            );
            await new Promise((resolve) => setTimeout(resolve, delays[attempt - 1]));
          }

          const genAI = this.getGenAI();
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          const parsed = this.safeParseJSON<{ tips: string[] }>(text);
          if (parsed?.tips && Array.isArray(parsed.tips)) {
            return parsed.tips.slice(0, 3);
          }
        } catch (e) {
          this.logger.warn(
            `Failed to generate tips with ${modelName} on attempt ${attempt}: ${e.message}`,
          );
        }
      }
    }

    return [
      'Track your meals consistently for better insights.',
      'Aim to drink at least 8 glasses of water today.',
      'Include a variety of protein sources in your diet.',
    ];
  }
}
