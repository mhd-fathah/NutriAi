import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop()
  password?: string;

  @Prop()
  googleId?: string;

  @Prop({ enum: ['credentials', 'google'], default: 'credentials' })
  provider?: 'credentials' | 'google';

  @Prop()
  image?: string;

  @Prop()
  emailVerified?: Date;

  @Prop()
  age?: number;

  @Prop({ enum: ['male', 'female'] })
  gender?: 'male' | 'female';

  @Prop()
  height?: number;

  @Prop()
  weight?: number;

  @Prop()
  activityLevel?: string;

  @Prop()
  bmi?: number;

  @Prop()
  goal?: string;

  @Prop()
  dailyCalories?: number;

  @Prop()
  dailyProtein?: number;

  @Prop()
  dailyCarbs?: number;

  @Prop()
  dailyFat?: number;

  @Prop({ default: false })
  onboardingCompleted?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
