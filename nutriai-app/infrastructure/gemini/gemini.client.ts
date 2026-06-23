import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiTipsResponse } from "@/types";
import { safeParseJSON } from "@/utils";
import { AI_CONFIG } from "@/config/ai.config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateNutritionTips(context: {
  goal: string;
  dailyCalories: number;
  consumedCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: AI_CONFIG.GEMINI_PRIMARY });

  const goalLabels: Record<string, string> = {
    lose_weight: "Lose Weight",
    maintain_weight: "Maintain Weight",
    gain_weight: "Gain Weight",
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

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = safeParseJSON<GeminiTipsResponse>(text);
    if (parsed?.tips && Array.isArray(parsed.tips)) {
      return parsed.tips.slice(0, 3);
    }
  } catch {
    // Silently fail and return defaults
  }

  return [
    "Track your meals consistently for better insights.",
    "Aim to drink at least 8 glasses of water today.",
    "Include a variety of protein sources in your diet.",
  ];
}