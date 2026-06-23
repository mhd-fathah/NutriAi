import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { AI_CONFIG } from "@/config/ai.config";
import { AIProviderFactory } from "@/infrastructure/ai/AIProviderFactory";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const geminiKeyLoaded = !!process.env.GEMINI_API_KEY;

  return NextResponse.json({
    geminiKeyLoaded,
    currentGeminiModel: AI_CONFIG.GEMINI_PRIMARY,
    geminiFallbackModel: AI_CONFIG.GEMINI_FALLBACK,
    lastRequestStatus: AIProviderFactory.lastRequestStatus,
    lastError: AIProviderFactory.lastError,
    lastResponseTime: AIProviderFactory.lastResponseTime,
  });
}