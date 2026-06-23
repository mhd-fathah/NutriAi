import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIFoodRecognitionService, NutritionAnalysis } from "@/domain/services/AIFoodRecognitionService";
import { safeParseJSON } from "@/utils";
import { z } from "zod";
import { AI_CONFIG } from "@/config/ai.config";

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

// Using the imported NutritionAnalysis interface from domain/services/AIFoodRecognitionService

const NutritionAnalysisSchema = z.object({
  foodName: z.string().default("Unknown Food"),
  estimatedWeight: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === "number") return `${val}g`;
      return val || "Unknown";
    })
    .default("Unknown"),
  calories: z.coerce.number().default(0),
  protein: z.coerce.number().default(0),
  carbs: z.coerce.number().default(0),
  fat: z.coerce.number().default(0),
  sugar: z.coerce.number().default(0),
});

export class GeminiVisionProvider implements AIFoodRecognitionService {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(modelName: string = AI_CONFIG.GEMINI_PRIMARY) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  private cleanAndParseJSON(text: string): NutritionAnalysis {
    console.log("Raw Response:\n", text);
    const rawLength = text.length;
    let jsonExtracted = false;
    let validationSuccess = false;
    let validationErrorMsg = "";

    try {
      // 3. Extract first valid JSON object using curly-brace block regex match
      let cleaned = text.trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
        jsonExtracted = true;
      }

      const parsedObj = safeParseJSON<any>(cleaned);
      if (!parsedObj) {
        throw new Error("JSON parsing failed");
      }

      // 4. Validate with Zod Schema
      const validated = NutritionAnalysisSchema.safeParse(parsedObj);
      if (validated.success) {
        validationSuccess = true;
        console.log(`[Parse Diagnostics]\nRaw Length: ${rawLength}\nJSON Extracted: ${jsonExtracted}\nValidation Success: ${validationSuccess}`);
        const parsedNutrition: NutritionAnalysis = {
          foodName: validated.data.foodName,
          estimatedWeight: validated.data.estimatedWeight,
          calories: validated.data.calories,
          protein: validated.data.protein,
          carbs: validated.data.carbs,
          fat: validated.data.fat,
          sugar: validated.data.sugar,
          isEstimated: false,
          aiStatus: "success",
          aiProvider: "gemini",
        };
        console.log("PARSED_DATA", parsedNutrition);
        return parsedNutrition;
      } else {
        validationErrorMsg = validated.error.message;
        throw validated.error;
      }
    } catch (err: any) {
      console.error(
        `[Parse Diagnostics]\nRaw Length: ${rawLength}\nJSON Extracted: ${jsonExtracted}\nValidation Success: ${validationSuccess}\nValidation Failure: ${validationErrorMsg || err.message}`
      );
      throw err;
    }
  }

  async analyzeFood(imageBase64: string, mimeType: string = "image/jpeg"): Promise<NutritionAnalysis> {
    const payloadSize = (imageBase64.length / 1024).toFixed(2);
    console.log(`[Gemini Request]\nModel: ${this.modelName}\nPayload: ${payloadSize}KB`);
    const start = Date.now();
    const model = this.genAI.getGenerativeModel({ model: this.modelName });

    try {
      const result = await model.generateContent([
        NUTRITION_PROMPT,
        { inlineData: { data: imageBase64, mimeType } },
      ]);
      const text = result.response.text();
      const parsed = this.cleanAndParseJSON(text);

      const duration = Date.now() - start;
      console.log(
        `[Gemini Response]\nModel: ${this.modelName}\nDuration: ${duration}ms\nStatus: Success`
      );
      return parsed;
    } catch (err: any) {
      const duration = Date.now() - start;
      console.error(
        `[Gemini Response]\nModel: ${this.modelName}\nDuration: ${duration}ms\nStatus: Failure\nError: ${err.message || err}`
      );
      throw err;
    }
  }
}