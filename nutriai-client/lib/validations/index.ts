import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const OnboardingSchema = z.object({
  age: z
    .number()
    .min(10, "Age must be at least 10")
    .max(120, "Age must be less than 120"),
  gender: z.enum(["male", "female"], {
    message: "Please select a gender",
  }),
  height: z
    .number()
    .min(50, "Height must be at least 50cm")
    .max(300, "Height must be less than 300cm"),
  weight: z
    .number()
    .min(20, "Weight must be at least 20kg")
    .max(500, "Weight must be less than 500kg"),
  activityLevel: z.enum(
    ["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"],
    { message: "Please select an activity level" }
  ),
});

export const MealUploadSchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snacks"], {
    message: "Please select a meal type",
  }),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type OnboardingInput = z.infer<typeof OnboardingSchema>;
export type MealUploadInput = z.infer<typeof MealUploadSchema>;
