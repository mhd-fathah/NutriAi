"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { LoginSchema, LoginInput } from "@/lib/validations";
import Button from "@/components/shared/Button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/utils";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl border border-white/80 shadow-xl shadow-emerald-500/5 p-8 animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your NutriAI account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className={cn(
                "w-full rounded-xl border bg-white pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400",
                "transition-all duration-200 outline-none",
                "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
                errors.email ? "border-red-400" : "border-gray-200 hover:border-gray-300"
              )}
              {...register("email")}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className={cn(
                "w-full rounded-xl border bg-white pl-10 pr-12 py-3 text-sm text-gray-900 placeholder-gray-400",
                "transition-all duration-200 outline-none",
                "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
                errors.password ? "border-red-400" : "border-gray-200 hover:border-gray-300"
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 accent-emerald-500"
              {...register("rememberMe")}
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
