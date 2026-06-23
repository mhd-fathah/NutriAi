"use server";

import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/infrastructure/database/mongodb";
import User from "@/models/User";
import Meal from "@/models/Meal";
import { AIProviderFactory } from "@/infrastructure/ai/AIProviderFactory";
import { generateNutritionTips } from "@/infrastructure/gemini/gemini.client";
import { uploadImageToCloudinary } from "@/infrastructure/cloudinary/cloudinary.client";
import { ActionResult, MealRecord } from "@/types";

export async function uploadAndAnalyzeMeal(
  formData: FormData
): Promise<ActionResult<MealRecord>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = session.user.id;

  const mealType = formData.get("mealType") as "breakfast" | "lunch" | "dinner" | "snacks";
  const imageFile = formData.get("image") as File;

  if (!mealType || !imageFile) {
    return { success: false, error: "Meal type and image are required" };
  }

  if (!["breakfast", "lunch", "dinner", "snacks"].includes(mealType)) {
    return { success: false, error: "Invalid meal type" };
  }

  // 7. Validate image size (<10MB) and format (jpg, jpeg, png, webp)
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(imageFile.type)) {
    return {
      success: false,
      error: "Unsupported image format. Please upload a JPG, JPEG, PNG, or WEBP image.",
    };
  }

  const maxSizeBytes = 10 * 1024 * 1024; // 10MB
  if (imageFile.size > maxSizeBytes) {
    return {
      success: false,
      error: "Image file is too large. Please upload an image smaller than 10MB.",
    };
  }

  // Convert file to base64
  const arrayBuffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = imageFile.type || "image/jpeg";

  const file = { name: imageFile.name, size: imageFile.size, type: imageFile.type };
  console.log("UPLOAD_FILE", file);

  try {
    await connectDB();

    // 1. Analyze using the AI Provider Fallback Architecture (Clean Architecture)
    const nutrition = await AIProviderFactory.analyzeFood(base64, mimeType);

    // 2. Upload to Cloudinary
    let imageUrl = "";
    try {
      const { url } = await uploadImageToCloudinary(base64, mimeType);
      imageUrl = url;
      const secure_url = imageUrl;
      console.log("CLOUDINARY_URL", secure_url);
    } catch (cloudinaryError) {
      console.error("Cloudinary upload failed, falling back to base64 Data URI:", cloudinaryError);
      imageUrl = `data:${mimeType};base64,${base64}`;
    }

    // 3. Get user for context
    const user = await User.findById(userId);

    // 4. Get today's meals for tip context
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayMeals = await Meal.find({
      userId: userId,
      createdAt: { $gte: startOfDay },
    });

    const consumed = todayMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Add current meal to consumed
    const totalCalories = consumed.calories + nutrition.calories;
    const totalProtein = consumed.protein + nutrition.protein;
    const totalCarbs = consumed.carbs + nutrition.carbs;
    const totalFat = consumed.fat + nutrition.fat;

    // 5. Generate AI tips
    const tips = await generateNutritionTips({
      goal: user?.goal || "maintain_weight",
      dailyCalories: user?.dailyCalories || 2000,
      consumedCalories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    });

    console.log("DB_IMAGE_URL", imageUrl);

    // Stage 2: Before DB Save
    const mealData = {
      userId: userId,
      mealType,
      imageUrl,
      foodName: nutrition.foodName,
      estimatedWeight: nutrition.estimatedWeight,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      sugar: nutrition.sugar,
      aiTips: tips,
      isEstimated: nutrition.isEstimated,
      aiStatus: nutrition.aiStatus,
      aiProvider: nutrition.aiProvider,
    };
    console.log("DB_SAVE_DATA", mealData);

    // 6. Save meal
    const meal = await Meal.create(mealData);

    const savedMeal = meal;
    console.log("SAVED_MEAL_IMAGE", savedMeal.imageUrl);

    // Stage 3: After DB Save
    console.log("DB_SAVED", meal);

    console.log(`Food:\n${meal.foodName}\n\nAI Status:\n${meal.aiStatus}\n\nProvider:\n${meal.aiProvider}\n\nisEstimated:\n${meal.isEstimated}`);

    const response = {
      success: true,
      data: {
        _id: meal._id.toString(),
        userId: userId,
        mealType: meal.mealType,
        imageUrl: meal.imageUrl,
        foodName: meal.foodName,
        estimatedWeight: meal.estimatedWeight,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        sugar: meal.sugar,
        aiTips: meal.aiTips,
        isEstimated: meal.isEstimated,
        aiStatus: meal.aiStatus,
        aiProvider: meal.aiProvider,
        createdAt: meal.createdAt.toISOString(),
      },
    };

    // Stage 4: Before Action Return
    console.log("ACTION_RESPONSE", response);

    return response;
  } catch (error) {
    // If AI recognition or database flow fails, generate a fallback estimated nutrition record
    try {
      await connectDB();
      let imageUrl = "";
      try {
        const { url } = await uploadImageToCloudinary(base64, mimeType);
        imageUrl = url;
      } catch {
        console.error("Cloudinary upload failed in fallback, using base64 Data URI");
        imageUrl = `data:${mimeType};base64,${base64}`;
      }

      const mealFallback = await Meal.create({
        userId: userId,
        mealType,
        imageUrl,
        foodName: "Estimated Meal",
        estimatedWeight: "250g",
        calories: 500,
        protein: 20,
        carbs: 60,
        fat: 15,
        sugar: 5,
        aiTips: [
          "AI service is currently busy. Estimated nutrition values have been used.",
          "Track your meals consistently for better insights.",
          "Aim to drink at least 8 glasses of water today.",
        ],
        isEstimated: true,
        aiStatus: "fallback",
        aiProvider: "local",
      });

      console.log(`Food:\n${mealFallback.foodName}\n\nAI Status:\n${mealFallback.aiStatus}\n\nProvider:\n${mealFallback.aiProvider}\n\nisEstimated:\n${mealFallback.isEstimated}`);

      return {
        success: true,
        data: {
          _id: mealFallback._id.toString(),
          userId: userId,
          mealType: mealFallback.mealType,
          imageUrl: mealFallback.imageUrl,
          foodName: mealFallback.foodName,
          estimatedWeight: mealFallback.estimatedWeight,
          calories: mealFallback.calories,
          protein: mealFallback.protein,
          carbs: mealFallback.carbs,
          fat: mealFallback.fat,
          sugar: mealFallback.sugar,
          aiTips: mealFallback.aiTips,
          isEstimated: mealFallback.isEstimated,
          aiStatus: mealFallback.aiStatus,
          aiProvider: mealFallback.aiProvider,
          createdAt: mealFallback.createdAt.toISOString(),
        },
      };
    } catch (fallbackError) {
      return { success: false, error: "Failed to log meal fallback" };
    }
  }
}
