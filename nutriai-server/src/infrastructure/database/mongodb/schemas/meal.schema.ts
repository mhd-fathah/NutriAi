import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type MealDocument = Meal & Document;

@Schema({ _id: false })
export class FoodItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  portion: string;

  @Prop({ required: true, default: 0 })
  estimatedWeight: number;

  @Prop({ required: true, default: 0 })
  calories: number;

  @Prop({ required: true, default: 0 })
  protein: number;

  @Prop({ required: true, default: 0 })
  carbs: number;

  @Prop({ required: true, default: 0 })
  fat: number;

  @Prop({ required: true, default: 0 })
  sugar: number;

  @Prop({ required: true, default: 0 })
  fiber: number;

  @Prop({ required: true, default: 0 })
  sodium: number;
}

const FoodItemSchema = SchemaFactory.createForClass(FoodItem);

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Meal {
  _id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['breakfast', 'lunch', 'dinner', 'snacks'] })
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  foodName: string;

  @Prop({ default: '' })
  estimatedWeight: string;

  @Prop({ required: true, default: 0 })
  calories: number;

  @Prop({ required: true, default: 0 })
  protein: number;

  @Prop({ required: true, default: 0 })
  carbs: number;

  @Prop({ required: true, default: 0 })
  fat: number;

  @Prop({ required: true, default: 0 })
  sugar: number;

  @Prop({ required: true, default: 0 })
  fiber: number;

  @Prop({ required: true, default: 0 })
  sodium: number;

  @Prop({ type: [FoodItemSchema], default: [] })
  foods: FoodItem[];

  @Prop({ required: true, default: 100 })
  confidence: number;

  @Prop({ required: true, default: '2.0' })
  analysisVersion: string;

  @Prop({ type: [String], default: [] })
  aiTips: string[];

  @Prop({ default: false })
  isEstimated: boolean;

  @Prop({ enum: ['success', 'fallback'], default: 'success' })
  aiStatus: 'success' | 'fallback';

  @Prop({ enum: ['gemini', 'local', 'fallback'], default: 'gemini' })
  aiProvider: 'gemini' | 'local' | 'fallback';

  @Prop({ index: true })
  imageHash?: string;

  createdAt: Date;
}

export const MealSchema = SchemaFactory.createForClass(Meal);

// Create compound and single-field indexes for querying meal history, types, and analytics efficiently
MealSchema.index({ userId: 1, createdAt: -1 });
MealSchema.index({ userId: 1, mealType: 1 });
MealSchema.index({ userId: 1, createdAt: 1 });
MealSchema.index({ createdAt: -1 });
