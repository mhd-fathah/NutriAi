"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { mealService } from "@/services/meal.service";
import { MealRecord, MealType } from "@/types";
import { MEAL_TYPES } from "@/constants";
import Button from "@/components/shared/Button";
import AIInsights from "@/components/dashboard/AIInsights";
import { Upload, X, Camera, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/utils";

const mealTypeOptions = Object.entries(MEAL_TYPES).map(([value, { label, icon }]) => ({
  value: value as MealType,
  label,
  icon,
}));

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealRecord | null>(null);
  const [dragging, setDragging] = useState(false);

  // Review & Confirmation specific states
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Compression specific states
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [compressionPercent, setCompressionPercent] = useState<number | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);

  const resetUploadState = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setCompressedFile(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setCompressionPercent(null);
    setLoading(false);
    setIsCompressing(false);
    setIsSaved(false);
    setSaving(false);
    setShowDiscardModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    console.log("UPLOAD_FILE", file);
    setSelectedFile(file);
    setResult(null);
    setOriginalSize(file.size);
    setIsCompressing(true);

    try {
      const { compressMealImage } = await import("@/lib/image/imageCompression");
      const compressed = await compressMealImage(file);
      
      setCompressedFile(compressed);
      setCompressedSize(compressed.size);
      
      const saved = Math.round((1 - compressed.size / file.size) * 100);
      setCompressionPercent(saved > 0 ? saved : 0);

      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(compressed);
    } catch (e) {
      console.error("Compression utility error, falling back to original:", e);
      setCompressedFile(file);
      setCompressedSize(file.size);
      setCompressionPercent(0);

      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (loading || isCompressing) return;
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  }, [loading, isCompressing]);

  const handleAnalyze = async () => {
    if (loading || isCompressing) return;
    const fileToUpload = compressedFile || selectedFile;
    if (!fileToUpload) {
      toast.error("Please select a meal image");
      return;
    }

    setLoading(true);
    try {
      // Convert file to base64 for API delivery
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(",")[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(fileToUpload);
      });

      const response = await mealService.analyzeMeal(
        mealType,
        base64Data,
        fileToUpload.type || "image/jpeg"
      );

      if (response.success && response.data) {
        console.log("FRONTEND_DATA", response.data);
        setResult(response.data);
        if (response.data.isEstimated) {
          toast.warning("AI service is currently busy. Estimated nutrition values have been used.");
        } else {
          toast.success("Meal analyzed successfully! Please verify details and save.");
        }
      } else {
        const errMsg = response.error || "";
        if (errMsg.includes("Missing GEMINI_API_KEY") || errMsg.includes("configuration")) {
          toast.error("Gemini API configuration error. Please notify the administrator.");
        } else if (errMsg.includes("Unsupported image") || errMsg.includes("too large")) {
          toast.error(errMsg);
        } else if (errMsg.includes("temporarily unavailable") || errMsg.includes("unavailable")) {
          toast.error("Food analysis is temporarily unavailable. Please try again later.");
        } else {
          toast.error("Unable to analyze image. Please try again.");
        }
      }
    } catch (err: any) {
      toast.error(err?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!result || saving) return;
    setSaving(true);
    try {
      const response = await mealService.createMeal(result);
      if (response.success) {
        toast.success("Meal saved successfully!");
        setIsSaved(true);
      } else {
        toast.error(response.error || "Failed to save meal. Please try again.");
      }
    } catch (err: any) {
      toast.error(err?.error || "Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    console.log("FRONTEND_DATA", result);
    const meal = result;
    console.log("UI_IMAGE_URL", meal.imageUrl);
    return (
      <div className="max-w-2xl mx-auto animate-fade-in-up pb-10 space-y-8">
        {/* REVIEW OR SUCCESS STATUS CARD */}
        {isSaved ? (
          <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 rounded-3xl p-5 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">Meal Saved Successfully!</p>
              <p className="text-xs opacity-90">This meal has been added to your history and dashboard.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-800 dark:text-white rounded-3xl p-5 flex items-center gap-3 shadow-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-zinc-50">Review Your Meal</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-semibold">Please verify the AI analysis before saving.</p>
            </div>
          </div>
        )}

        {/* RESULT HERO */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/10 shadow-2xl bg-slate-950">
          <div className="relative h-64 md:h-80 w-full overflow-hidden">
            <Image
              src={meal.imageUrl ? meal.imageUrl : "/images/food-placeholder.jpg"}
              alt={meal.foodName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            {/* AI CONFIDENCE BADGE */}
            <div className="absolute top-4 left-4 z-10">
              {result.isEstimated ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Estimated values used (AI Busy)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Analysis Complete</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                {meal.mealType}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {meal.createdAt ? new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{meal.foodName}</h1>
            <p className="text-xs text-slate-400 font-semibold">Portion size: {meal.estimatedWeight}</p>
          </div>
        </div>

        {/* NUTRITION CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
            <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-bold tracking-wider mb-1">Calories</p>
            <p className="text-2xl font-black text-gray-900 dark:text-zinc-100 leading-none">
              {meal.calories}
              <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500 ml-0.5">kcal</span>
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
            <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-bold tracking-wider mb-1">Protein</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 leading-none">
              {meal.protein}
              <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500 ml-0.5">g</span>
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
            <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-bold tracking-wider mb-1">Carbs</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">
              {meal.carbs}
              <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500 ml-0.5">g</span>
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
            <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase font-bold tracking-wider mb-1">Fat</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 leading-none">
              {meal.fat}
              <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500 ml-0.5">g</span>
            </p>
          </div>
        </div>

        {/* DETAILED FOOD BREAKDOWN */}
        {meal.foods && meal.foods.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-4 tracking-tight">Ingredient Breakdown</h2>
            <div className="space-y-4">
              {meal.foods.map((food, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-zinc-800/80 last:border-b-0">
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-zinc-200">{food.name}</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold">{food.portion} &bull; {food.estimatedWeight}g</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-800 dark:text-zinc-200">{food.calories} kcal</p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI COACH RECOMMENDATIONS */}
        {meal.aiTips && meal.aiTips.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Sparkles size={16} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 tracking-tight">AI Coach Advice</h2>
            </div>
            
            <AIInsights tips={meal.aiTips} hasData={true} />
          </div>
        )}

        {isSaved ? (
          <div className="flex gap-4">
            <Button
              className="flex-1 py-3.5 rounded-2xl font-bold bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 active:scale-[0.98] transition-all"
              onClick={resetUploadState}
            >
              Scan Another Meal
            </Button>
            <Button
              className="flex-1 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white active:scale-[0.98] transition-all"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 py-3.5 rounded-2xl font-bold border-rose-500/20 hover:bg-rose-500/10 text-rose-500 active:scale-[0.98] transition-all"
              disabled={saving}
              onClick={() => setShowDiscardModal(true)}
            >
              Discard
            </Button>
            <Button
              className="flex-1 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white active:scale-[0.98] transition-all"
              disabled={saving}
              onClick={handleSaveMeal}
            >
              {saving ? "Saving Meal..." : "Save Meal"}
            </Button>
          </div>
        )}

        {/* DISCARD CONFIRMATION MODAL */}
        {showDiscardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-6 animate-scale-in">
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto text-xl">
                  ⚠️
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-50">Discard Analysis?</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed font-medium">
                  This meal will not be saved to your history.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 transition-all"
                  onClick={() => setShowDiscardModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-lg shadow-rose-500/20"
                  onClick={resetUploadState}
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in-up pb-10 space-y-6">
      {/* SECTION 1: HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight">
          Scan a New Meal
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium leading-relaxed">
          Upload a clear photo of your food plate. Gemini AI will automatically detect foods, estimate macros, and offer coaching tips.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-100/40 dark:shadow-none p-6 md:p-8 space-y-6">
        {/* SECTION 2: MEAL TYPE SELECTOR */}
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-3.5 tracking-tight uppercase">Meal Type</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mealTypeOptions.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                disabled={loading || isCompressing}
                onClick={() => setMealType(value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 active:scale-[0.97]",
                  mealType === value
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                    : "border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 text-gray-600 dark:text-zinc-400 bg-white dark:bg-zinc-900",
                  (loading || isCompressing) && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                <span className="text-2xl transition-transform duration-300 hover:scale-110">{icon}</span>
                <span className="text-xs font-bold tracking-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 3 & 4: UPLOAD AREA / IMAGE PREVIEW */}
        <div
          onDragOver={(e) => { e.preventDefault(); if (!loading && !isCompressing) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !preview && !isCompressing && !loading && fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-3xl transition-all duration-300 overflow-hidden",
            preview ? "border-transparent shadow-md" : "cursor-pointer border-gray-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-500/30 hover:bg-emerald-500/[0.01]",
            dragging ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10" : "",
            (loading || isCompressing) && "pointer-events-none opacity-50"
          )}
        >
          {isCompressing ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-pulse">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-gray-900 dark:text-zinc-100 animate-pulse">Compressing Image...</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold animate-pulse">Optimizing for AI Analysis...</p>
              </div>
            </div>
          ) : preview ? (
            <div className="relative h-72 w-full group">
              <Image 
                src={preview} 
                alt="Preview" 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-75" 
              />
              
              {/* Floating Image overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
              
              <div className="absolute bottom-4 left-4 text-white space-y-1">
                <p className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-md w-fit">
                  {compressedSize ? `${(compressedSize / 1024).toFixed(1)} KB (Optimized)` : ""}
                </p>
                <p className="text-sm font-bold capitalize">Selected: {mealType}</p>
              </div>

              <button
                type="button"
                disabled={loading || isCompressing}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setPreview(null);
                  setCompressedFile(null);
                  setOriginalSize(null);
                  setCompressedSize(null);
                  setCompressionPercent(null);
                }}
                className={cn(
                  "absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-black/80 hover:scale-105 text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95",
                  (loading || isCompressing) && "opacity-50 pointer-events-none"
                )}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-gray-900 dark:text-zinc-100">Upload Meal Photo</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Drag & drop your file here, or click to browse</p>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-wider">
                JPEG, PNG, WebP &bull; max 10MB
              </p>
            </div>
          )}
        </div>

        {/* SECTION 4.5: OPTIMIZATION STATISTICS */}
        {!isCompressing && preview && originalSize && compressedSize && (
          <div className="p-4 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.01] border border-dashed border-emerald-500/20 rounded-2xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">⚡ Image Optimized for AI</span>
              <span className="bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">Saved {compressionPercent}%</span>
            </div>
            
            {/* Visual progress bar representing the compression ratio */}
            <div className="w-full bg-gray-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" 
                style={{ width: `${compressionPercent}%` }} 
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-zinc-400">
              <div>
                <span className="text-gray-400 dark:text-zinc-500">Original:</span> {originalSize > 1024 * 1024 ? `${(originalSize / 1024 / 1024).toFixed(2)} MB` : `${(originalSize / 1024).toFixed(1)} KB`}
              </div>
              <div>
                <span className="text-gray-400 dark:text-zinc-500">Compressed:</span> {(compressedSize / 1024).toFixed(1)} KB
              </div>
              <div>
                <span className="text-gray-400 dark:text-zinc-500">Saved:</span> {compressionPercent}%
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(file);
          }}
        />

        {!preview && !isCompressing && (
          <Button
            variant="outline"
            disabled={loading || isCompressing}
            className="w-full py-3.5 rounded-2xl font-bold border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-[0.99] transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            Choose from gallery
          </Button>
        )}

        {/* SECTION 5: AI ANALYSIS BUTTON & CUSTOM LOADER VIEW */}
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-xl">🤖</span>
              <div>
                <p className="text-sm font-bold">Gemini AI is scanning your meal...</p>
                <p className="text-xs text-gray-400">Please keep this window open</p>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-2/3 animate-infinite-scroll" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-gray-400">
              <p className="flex items-center gap-1.5">✓ Uploading image</p>
              <p className="flex items-center gap-1.5 animate-pulse">&bull; Identifying foods</p>
              <p className="flex items-center gap-1.5 text-gray-600">&bull; Calculating macros</p>
              <p className="flex items-center gap-1.5 text-gray-600">&bull; Writing tips</p>
            </div>
          </div>
        ) : (
          <Button
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-base font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all"
            size="lg"
            disabled={!selectedFile || isCompressing}
            onClick={handleAnalyze}
          >
            <Sparkles size={16} />
            Analyze with Gemini AI
          </Button>
        )}
      </div>

      {/* EMPTY ONBOARDING TIPS SECTION */}
      {!preview && !loading && !isCompressing && (
        <div className="bg-emerald-500/[0.01] dark:bg-emerald-500/[0.005] border border-dashed border-emerald-500/20 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">Tips for Best Analysis Accuracy</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500 dark:text-zinc-400">
            <p className="flex items-center gap-1.5">&bull; Take photo in bright, natural light</p>
            <p className="flex items-center gap-1.5">&bull; Keep all food centered in frame</p>
            <p className="flex items-center gap-1.5">&bull; Use a clear top-down angle</p>
            <p className="flex items-center gap-1.5">&bull; Avoid motion blur or dark frames</p>
          </div>
        </div>
      )}
    </div>
  );
}
