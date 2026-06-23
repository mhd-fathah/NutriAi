"use server";

import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth/auth";
import { connectDB } from "@/infrastructure/database/mongodb";
import User from "@/models/User";
import { RegisterSchema, LoginSchema } from "@/lib/validations";
import { ActionResult } from "@/types";
import { AuthError } from "next-auth";

export async function registerUser(
  data: unknown
): Promise<ActionResult<{ email: string }>> {
  const validated = RegisterSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const { name, email, password } = validated.data;

  try {
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return { success: false, error: "An account with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
      onboardingCompleted: false,
    });

    return { success: true, data: { email } };
  } catch {
    return { success: false, error: "Failed to create account. Please try again." };
  }
}

export async function loginUser(
  data: unknown
): Promise<ActionResult> {
  const validated = LoginSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  try {
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function logoutUser(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
