import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type MealDocument = Meal & Document;

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

  @Prop({ type: [String], default: [] })
  aiTips: string[];

  @Prop({ default: false })
  isEstimated: boolean;

  @Prop({ enum: ['success', 'fallback'], default: 'success' })
  aiStatus: 'success' | 'fallback';

  @Prop({ enum: ['gemini', 'local'], default: 'gemini' })
  aiProvider: 'gemini' | 'local';

  createdAt: Date;
}

export const MealSchema = SchemaFactory.createForClass(Meal);

// Create compound index for querying meal history efficiently
MealSchema.index({ userId: 1, createdAt: -1 });
