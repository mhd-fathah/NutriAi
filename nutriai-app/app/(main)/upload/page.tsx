"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { uploadAndAnalyzeMeal } from "@/actions/meal.actions";
import { MealRecord, MealType } from "@/types";
import { MEAL_TYPES } from "@/constants";
import Button from "@/components/shared/Button";
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

  const handleFileChange = (file: File) => {
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
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please select a meal image");
      return;
    }

    setLoading(true);
    try {
      // 8. Compress and resize image using HTML5 Canvas prior to upload
      const compressedFile = await new Promise<Blob>((resolve, reject) => {
        const img = new window.Image();
        img.src = URL.createObjectURL(selectedFile);
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDimension = 1024;

          // Resize aspect ratio constraints
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return reject(new Error("Failed to get 2d context"));
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                console.log(`[Image Compress] Original Size: ${(selectedFile.size / 1024).toFixed(2)} KB, Compressed Size: ${(blob.size / 1024).toFixed(2)} KB`);
                resolve(blob);
              } else {
                reject(new Error("Canvas compression returned empty blob"));
              }
            },
            "image/jpeg",
            0.8
          );
        };
        img.onerror = () => reject(new Error("Failed to load image element"));
      });

      const formData = new FormData();
      formData.append("image", compressedFile, "compressed_meal.jpg");
      formData.append("mealType", mealType);

      const response = await uploadAndAnalyzeMeal(formData);
      if (response.success && response.data) {
        console.log("FRONTEND_DATA", response.data);
        setResult(response.data);
        if (response.data.isEstimated) {
          toast.warning("AI service is currently busy. Estimated nutrition values have been used.");
        } else {
          toast.success("Meal analyzed and saved!");
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
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    console.log("FRONTEND_DATA", result);
    const meal = result;
    console.log("UI_IMAGE_URL", meal.imageUrl);
    return (
      <div className="max-w-2xl mx-auto animate-fade-in-up pb-10 space-y-8">
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

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white uppercase tracking-wider">
                  {mealType}
                </span>
                <span className="text-xs font-bold text-gray-300">
                  {new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="text-white text-3xl font-extrabold tracking-tight">{result.foodName}</h2>
              <p className="text-gray-300 text-sm font-semibold">Weight: ~{result.estimatedWeight}</p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6 bg-white">
            {/* NUTRITION METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Calories", value: result.calories, unit: "kcal", color: "rose", bg: "bg-rose-50/50", border: "border-rose-100/50", text: "text-rose-700" },
                { label: "Protein", value: result.protein, unit: "g", color: "emerald", bg: "bg-emerald-50/50", border: "border-emerald-100/50", text: "text-emerald-700" },
                { label: "Carbs", value: result.carbs, unit: "g", color: "blue", bg: "bg-blue-50/50", border: "border-blue-100/50", text: "text-blue-700" },
                { label: "Fat", value: result.fat, unit: "g", color: "amber", bg: "bg-amber-50/50", border: "border-amber-100/50", text: "text-amber-700" },
                { label: "Sugar", value: result.sugar, unit: "g", color: "purple", bg: "bg-purple-50/50", border: "border-purple-100/50", text: "text-purple-700" },
              ].map(({ label, value, unit, border, text }) => (
                <div key={label} className={cn("rounded-2xl p-4 text-center border bg-white shadow-sm hover:-translate-y-0.5 transition-all duration-200", border)}>
                  <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">{label}</p>
                  <p className={cn("text-2xl font-black leading-none", text)}>
                    {Math.round(value)}
                    <span className="text-xs font-semibold text-gray-400 ml-0.5">{unit}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* AI COACH PANEL */}
            {result.aiTips.length > 0 && (
              <div className="bg-emerald-500/[0.02] border border-dashed border-emerald-500/20 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">AI Nutrition Coach Insights</h3>
                    <p className="text-[11px] text-gray-400">Personal recommendations based on this meal</p>
                  </div>
                </div>
                <div className="space-y-2.5 pl-1">
                  {result.aiTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-gray-600">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <p className="leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 pt-2">
              <Button
                variant="outline"
                className="flex-1 py-3.5 rounded-2xl font-bold border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                  setResult(null);
                }}
              >
                Log another
              </Button>
              <Button 
                className="flex-1 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all" 
                onClick={() => router.push("/dashboard")}
              >
                View dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up pb-10 space-y-8">
      {/* SECTION 1: PREMIUM HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/10 bg-gradient-to-br from-emerald-950 via-slate-900 to-black p-6 md:p-8 shadow-xl shadow-emerald-500/5">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-xl backdrop-blur-md">
              ✨
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              AI Food Scanner
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Upload a meal photo and get instant nutrition analysis. Powered by Google Gemini AI, it calculates calories, counts target macros, and gives insights.
            </p>
            
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {[
                "AI Food Recognition",
                "Nutrition Breakdown",
                "Calorie Tracking",
                "Personal Coaching Insights"
              ].map((feature) => (
                <span key={feature} className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  ✓ {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 p-6 md:p-8 space-y-6">
        {/* SECTION 2: MEAL TYPE SELECTOR */}
        <div>
          <p className="text-sm font-bold text-gray-900 mb-3.5 tracking-tight uppercase">Meal Type</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mealTypeOptions.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMealType(value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 active:scale-[0.97]",
                  mealType === value
                    ? "border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/5 text-emerald-700"
                    : "border-gray-100 hover:border-gray-200 text-gray-600 bg-white"
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
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !preview && fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-3xl transition-all duration-300 overflow-hidden",
            preview ? "border-transparent shadow-md" : "cursor-pointer border-gray-200 hover:border-emerald-400 hover:bg-emerald-500/[0.01]",
            dragging ? "border-emerald-500 bg-emerald-50/50" : ""
          )}
        >
          {preview ? (
            <div className="relative h-72 w-full group">
              <Image src={preview} alt="Preview" fill className="object-cover transition-transform duration-75" />
              
              {/* Floating Image overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
              
              <div className="absolute bottom-4 left-4 text-white space-y-1">
                <p className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-md w-fit">
                  {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                </p>
                <p className="text-sm font-bold capitalize">Selected: {mealType}</p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-black/80 hover:scale-105 text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-gray-900">Upload Meal Photo</p>
                <p className="text-xs text-gray-400">Drag & drop your file here, or click to browse</p>
              </div>
              <p className="text-[10px] text-gray-400 font-semibold bg-gray-50 border border-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
                JPEG, PNG, WebP &bull; max 10MB
              </p>
            </div>
          )}
        </div>

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

        {!preview && (
          <Button
            variant="outline"
            className="w-full py-3.5 rounded-2xl font-bold border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition-all"
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
            disabled={!selectedFile}
            onClick={handleAnalyze}
          >
            <Sparkles size={16} />
            Analyze with Gemini AI
          </Button>
        )}
      </div>

      {/* EMPTY ONBOARDING TIPS SECTION */}
      {!preview && !loading && (
        <div className="bg-emerald-500/[0.01] border border-dashed border-emerald-500/20 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <p className="text-sm font-bold text-gray-900">Tips for Best Analysis Accuracy</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500">
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
