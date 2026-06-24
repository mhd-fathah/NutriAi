import { AI_CONFIG } from "@/config/ai.config";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("=================================");
    console.log("NutriAI Client Starting");
    console.log("=================================");
  }
}