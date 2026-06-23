import { GeminiVisionProvider } from "./gemini/GeminiVisionProvider";
import { NutritionAnalysis } from "@/domain/services/AIFoodRecognitionService";
import { AI_CONFIG } from "@/config/ai.config";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class AIProviderFactory {
  // Global mutable variable strictly for the admin debug dashboard
  public static lastRequestStatus: "Success" | "Failure" | "Idle" = "Idle";
  public static lastError: string | null = null;
  public static lastResponseTime: number = 0;

  /**
   * Orchestrates the food recognition flow:
   * 1. Try gemini-2.5-flash (Primary).
   * 2. If it fails, retry after 2s, 5s, and 10s (3 retries).
   * 3. If it still fails, switch to gemini-2.0-flash (Fallback) and retry once.
   * 4. If all fail, return estimated nutrition values without throwing.
   */
  public static async analyzeFood(
    imageBase64: string,
    mimeType: string = "image/jpeg"
  ): Promise<NutritionAnalysis> {
    const primaryProvider = new GeminiVisionProvider(AI_CONFIG.GEMINI_PRIMARY);
    const fallbackProvider = new GeminiVisionProvider(AI_CONFIG.GEMINI_FALLBACK);

    const primaryRetries = 3; // Retry 3 times
    const delays = [2000, 5000, 10000];

    // Phase 1: Try Primary Gemini Model (with 3 retries and 2s, 5s, 10s delays)
    for (let attempt = 0; attempt <= primaryRetries; attempt++) {
      const start = Date.now();
      try {
        if (attempt > 0) {
          console.warn(`[AI Request] Retrying Primary Gemini Model attempt ${attempt} of ${primaryRetries} after ${delays[attempt - 1]}ms delay...`);
          await delay(delays[attempt - 1]);
        }
        
        const result = await primaryProvider.analyzeFood(imageBase64, mimeType);
        
        this.lastRequestStatus = "Success";
        this.lastError = null;
        this.lastResponseTime = Date.now() - start;
        
        return result;
      } catch (err: any) {
        this.lastRequestStatus = "Failure";
        this.lastError = err.message || "Unknown error";
        this.lastResponseTime = Date.now() - start;

        if (attempt === primaryRetries) {
          console.error(`[AI Provider] Primary model failed all attempts. Switching to Fallback: ${AI_CONFIG.GEMINI_FALLBACK}`);
        }
      }
    }

    // Phase 2: Fallback Gemini Model (Try once)
    const startFallback = Date.now();
    try {
      const result = await fallbackProvider.analyzeFood(imageBase64, mimeType);
      
      this.lastRequestStatus = "Success";
      this.lastError = null;
      this.lastResponseTime = Date.now() - startFallback;

      return result;
    } catch (err: any) {
      console.error(`[AI Provider] Fallback Model ${AI_CONFIG.GEMINI_FALLBACK} failed: ${err.message || err}`);
      
      this.lastRequestStatus = "Failure";
      this.lastError = err.message || "Unknown error";
      this.lastResponseTime = Date.now() - startFallback;

      // Phase 3: Fallback nutrition estimation instead of throwing
      console.warn("[AI Provider] All Gemini attempts failed. Generating fallback nutrition estimation...");
      return {
        foodName: "Estimated Meal",
        estimatedWeight: "250g",
        calories: 500,
        protein: 20,
        carbs: 60,
        fat: 15,
        sugar: 5,
        isEstimated: true,
        aiStatus: "fallback",
        aiProvider: "local",
      };
    }
  }
}