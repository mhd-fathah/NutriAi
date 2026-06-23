import { AI_CONFIG } from "@/config/ai.config";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const key = process.env.GEMINI_API_KEY;
    const isKeyLoaded = key ? "YES" : "NO";
    
    console.log("=================================");
    console.log("AI CONFIGURATION");
    console.log("================\n");
    console.log(`Primary Model: ${AI_CONFIG.GEMINI_PRIMARY}`);
    console.log(`Fallback Model: ${AI_CONFIG.GEMINI_FALLBACK}`);
    console.log(`Gemini Key Loaded: ${isKeyLoaded}`);
    console.log("======================");

    if (!key) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }
  }
}