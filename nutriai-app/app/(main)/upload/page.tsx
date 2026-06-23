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
      <div className="max-w-lg mx-auto animate-fade-in-up">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="relative h-56">
            <Image
              src={meal.imageUrl ? meal.imageUrl : "/images/food-placeholder.jpg"}
              alt={meal.foodName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-2 mb-1">
                {result.isEstimated ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <p className="text-amber-300 text-sm font-medium">Estimated values used (AI Busy)</p>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <p className="text-emerald-300 text-sm font-medium">AI Analysis Complete</p>
                  </>
                )}
              </div>
              <h2 className="text-white text-xl font-bold">{result.foodName}</h2>
              <p className="text-white/60 text-sm">~{result.estimatedWeight}</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Calories", value: result.calories, unit: "kcal", color: "emerald" },
                { label: "Protein", value: result.protein, unit: "g", color: "blue" },
                { label: "Carbs", value: result.carbs, unit: "g", color: "amber" },
                { label: "Fat", value: result.fat, unit: "g", color: "purple" },
                { label: "Sugar", value: result.sugar, unit: "g", color: "rose" },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className={cn(
                  "rounded-xl p-3 text-center",
                  color === "emerald" && "bg-emerald-50",
                  color === "blue" && "bg-blue-50",
                  color === "amber" && "bg-amber-50",
                  color === "purple" && "bg-purple-50",
                  color === "rose" && "bg-rose-50",
                )}>
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className={cn(
                    "text-xl font-bold",
                    color === "emerald" && "text-emerald-700",
                    color === "blue" && "text-blue-700",
                    color === "amber" && "text-amber-700",
                    color === "purple" && "text-purple-700",
                    color === "rose" && "text-rose-700",
                  )}>{Math.round(value)}<span className="text-sm font-normal ml-0.5">{unit}</span></p>
                </div>
              ))}
            </div>

            {result.aiTips.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-semibold text-gray-900">AI Nutrition Tips</p>
                </div>
                <div className="space-y-2">
                  {result.aiTips.map((tip, i) => (
                    <p key={i} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span> {tip}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                  setResult(null);
                }}
              >
                Log another
              </Button>
              <Button className="flex-1" onClick={() => router.push("/dashboard")}>
                View dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Log a Meal</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a photo and let AI analyze your nutrition</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Meal type */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Meal Type</p>
          <div className="grid grid-cols-4 gap-2">
            {mealTypeOptions.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMealType(value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200",
                  mealType === value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-100 hover:border-gray-200"
                )}
              >
                <span className="text-xl">{icon}</span>
                <span className={cn(
                  "text-xs font-medium",
                  mealType === value ? "text-emerald-700" : "text-gray-600"
                )}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !preview && fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl transition-all duration-200 overflow-hidden",
            preview ? "border-transparent cursor-default" : "cursor-pointer",
            dragging ? "border-emerald-500 bg-emerald-50" : preview ? "" : "border-gray-200 hover:border-emerald-400 hover:bg-gray-50"
          )}
        >
          {preview ? (
            <div className="relative h-64">
              <Image src={preview} alt="Preview" fill className="object-cover rounded-2xl" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="absolute top-3 right-3 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
                <Camera className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Drop your meal photo here</p>
              <p className="text-xs text-gray-400 mt-1">or click to browse · JPEG, PNG, WebP · max 10MB</p>
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
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            Choose from gallery
          </Button>
        )}

        <Button
          className="w-full"
          size="lg"
          loading={loading}
          disabled={!selectedFile}
          onClick={handleAnalyze}
        >
          <Sparkles size={16} />
          {loading ? "Analyzing with AI..." : "Analyze with Gemini AI"}
        </Button>
      </div>
    </div>
  );
}
