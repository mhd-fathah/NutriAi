import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMeal extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  imageUrl: string;
  foodName: string;
  estimatedWeight: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  aiTips: string[];
  isEstimated: boolean;
  aiStatus: "success" | "fallback";
  aiProvider: "gemini" | "local";
  createdAt: Date;
}

const MealSchema = new Schema<IMeal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snacks"],
      required: true,
    },
    imageUrl: { type: String, required: true },
    foodName: { type: String, required: true },
    estimatedWeight: { type: String, default: "" },
    calories: { type: Number, required: true, default: 0 },
    protein: { type: Number, required: true, default: 0 },
    carbs: { type: Number, required: true, default: 0 },
    fat: { type: Number, required: true, default: 0 },
    sugar: { type: Number, required: true, default: 0 },
    aiTips: { type: [String], default: [] },
    isEstimated: { type: Boolean, default: false },
    aiStatus: { type: String, enum: ["success", "fallback"], default: "success" },
    aiProvider: { type: String, enum: ["gemini", "local"], default: "gemini" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for efficient daily/weekly queries
MealSchema.index({ userId: 1, createdAt: -1 });

if (mongoose.models.Meal) {
  delete (mongoose.models as any).Meal;
}

const Meal: Model<IMeal> = mongoose.model<IMeal>("Meal", MealSchema);

export default Meal;
