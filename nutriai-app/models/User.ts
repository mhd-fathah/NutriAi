import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  provider?: "credentials" | "google";
  image?: string;
  emailVerified?: Date;
  age?: number;
  gender?: "male" | "female";
  height?: number;
  weight?: number;
  activityLevel?: string;
  bmi?: number;
  goal?: string;
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  onboardingCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    googleId: { type: String },
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    image: { type: String },
    emailVerified: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female"] },
    height: { type: Number },
    weight: { type: Number },
    activityLevel: { type: String },
    bmi: { type: Number },
    goal: { type: String },
    dailyCalories: { type: Number },
    dailyProtein: { type: Number },
    dailyCarbs: { type: Number },
    dailyFat: { type: Number },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === "development") {
  delete (mongoose.models as any).User;
}

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
