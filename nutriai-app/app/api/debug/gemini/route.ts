import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { AIProviderFactory } from "@/infrastructure/ai/AIProviderFactory";
import { AI_CONFIG } from "@/config/ai.config";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { image, mimeType } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "Missing test image base64 data" }, { status: 400 });
    }

    const start = Date.now();
    const nutrition = await AIProviderFactory.analyzeFood(image, mimeType || "image/jpeg");
    const duration = Date.now() - start;

    return NextResponse.json({
      success: true,
      apiKeyLoaded: !!process.env.GEMINI_API_KEY,
      primaryModel: AI_CONFIG.GEMINI_PRIMARY,
      fallbackModel: AI_CONFIG.GEMINI_FALLBACK,
      durationMs: duration,
      payloadSize: image.length,
      rawResponse: nutrition,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      apiKeyLoaded: !!process.env.GEMINI_API_KEY,
      primaryModel: AI_CONFIG.GEMINI_PRIMARY,
      fallbackModel: AI_CONFIG.GEMINI_FALLBACK,
      error: err.message || "Failed to analyze test image",
    }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    apiKeyLoaded: !!process.env.GEMINI_API_KEY,
    primaryModel: AI_CONFIG.GEMINI_PRIMARY,
    fallbackModel: AI_CONFIG.GEMINI_FALLBACK,
  });
}