"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { LoginSchema, LoginInput } from "@/lib/validations";
import Button from "@/components/shared/Button";
import GoogleButton from "@/components/shared/GoogleButton";
import { Mail, Lock, Eye, EyeOff, Sparkles, TrendingUp, Target, ShieldCheck } from "lucide-react";
import { cn } from "@/utils";
import Logo from "@/components/shared/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "OAuthSignin" || errorParam === "OAuthCallback") {
        toast.error("Google sign-in was cancelled or failed. Please try again.");
      } else if (errorParam === "OAuthCreateAccount") {
        toast.error("Could not link Google account. Please try again.");
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    }
  }, [searchParams]);

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
    <>
      {/* LEFT PANEL: BRAND SHOWCASE */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-emerald-950 via-slate-900 to-black p-12 relative overflow-hidden">
        {/* Glowing Blobs */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Brand header */}
        <div className="flex items-center gap-3 relative z-10">
          <Logo size={40} className="border border-white/10 rounded-2xl" />
          <div>
            <p className="font-extrabold text-white text-base tracking-tight">NutriAI</p>
            <p className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">AI Nutrition Coach</p>
          </div>
        </div>

        {/* Feature showcase */}
        <div className="space-y-8 relative z-10 my-auto">
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-white leading-tight tracking-tight">
              Track Smarter.<br />Eat Better.<br />Live Healthier.
            </h2>
            <p className="text-gray-300 text-sm max-w-md leading-relaxed">
              Upload meals, analyze nutrition instantly with advanced AI models, and achieve your health objectives faster.
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            {[
              { icon: Sparkles, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", title: "AI Food Recognition", desc: "Analyze meals instantly using Gemini AI models." },
              { icon: TrendingUp, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", title: "Smart Nutrition Analytics", desc: "Track daily targets for calories, protein, carbs, and fat." },
              { icon: Target, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", title: "Personalized Health Goals", desc: "Get tailored coaching recommendations based on your metabolic profile." }
            ].map(({ icon: Icon, color, title, desc }, index) => (
              <div key={index} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0", color)}>
                  <Icon size={18} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white">{title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10">
          <p className="text-xs text-gray-500 font-medium">
            NutriAI v1.0 &bull; Secure Authentication Enabled
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: LOGIN FORM */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-gray-50/50 min-h-screen">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Mobile brand header */}
          <div className="flex lg:hidden flex-col items-center text-center space-y-3 mb-4">
            <Logo size={48} />
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">NutriAI</h2>
              <p className="text-xs font-bold text-emerald-600 tracking-wider uppercase">AI Nutrition Tracker</p>
            </div>
          </div>

          {/* Form container */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 p-6 md:p-8 space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back </h3>
              <p className="text-xs text-gray-400">Continue your automated nutrition journey</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email</label>
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
                      "transition-all duration-300 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",
                      errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-500/10" : "border-gray-100 hover:border-gray-200"
                    )}
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
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
                      "transition-all duration-300 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",
                      errors.password ? "border-red-400 focus:border-red-400 focus:ring-red-500/10" : "border-gray-100 hover:border-gray-200"
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
                {errors.password && <p className="text-[10px] font-bold text-red-500">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-200 accent-emerald-500 cursor-pointer"
                    {...register("rememberMe")}
                  />
                  <span className="text-xs text-gray-500 font-semibold">Remember me</span>
                </label>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 active:scale-[0.98]"
                size="lg"
                loading={loading}
              >
                Sign In to NutriAI
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-gray-150 flex-1" />
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">or continue with</span>
              <div className="h-px bg-gray-150 flex-1" />
            </div>

            {/* Google Button */}
            <GoogleButton mode="signin" />

            {/* Social proof badges */}
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-4 text-[10px] text-gray-400 font-bold tracking-wider uppercase">
              <span className="flex items-center gap-1"><Sparkles size={11} className="text-emerald-500" /> AI Insights</span>
              <span className="flex items-center gap-1"><TrendingUp size={11} className="text-blue-500" /> Smart Tracking</span>
              <span className="flex items-center gap-1"><ShieldCheck size={11} className="text-amber-500" /> Secure Auth</span>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 font-semibold">
            New to NutriAI?{" "}
            <Link
              href="/signup"
              className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <p className="text-sm font-semibold text-gray-500 animate-pulse">Loading auth...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
