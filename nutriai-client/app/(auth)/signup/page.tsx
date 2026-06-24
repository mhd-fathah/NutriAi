"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { RegisterSchema, RegisterInput } from "@/lib/validations";
import { authService } from "@/services/auth.service";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import GoogleButton from "@/components/shared/GoogleButton";
import { Mail, Lock, User, Sparkles, TrendingUp, Target, ShieldCheck } from "lucide-react";
import { cn } from "@/utils";
import Logo from "@/components/shared/Logo";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const result = await authService.register(data.name, data.email, data.password);
      if (result.success) {
        toast.success("Account created! Let's set up your profile.");
        // Auto login after register
        const { signIn } = await import("next-auth/react");
        await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        router.push("/onboarding");
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* LEFT PANEL: BRAND EXPERIENCE */}
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
              Start Your Health<br />Transformation Today
            </h2>
            <p className="text-gray-300 text-sm max-w-md leading-relaxed">
              Track meals, analyze nutrition with AI, and achieve your goals with personalized insights.
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            {[
              { icon: Sparkles, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", title: "AI Food Recognition", desc: "Instantly identify foods and nutrition from photos." },
              { icon: TrendingUp, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", title: "Advanced Analytics", desc: "Track calories, protein, carbs, fats, and trends." },
              { icon: Target, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", title: "Personalized Goals", desc: "Smart nutrition targets based on your metabolic profile." }
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

        {/* Footer info & badges */}
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap gap-2">
            {["AI Powered", "Secure", "Nutrition Focused", "Personalized"].map((badge) => (
              <span key={badge} className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ✓ {badge}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 font-medium">
            NutriAI v1.0 &bull; Secure Encrypted Registration
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: REGISTRATION FORM */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-gray-50/50 dark:bg-zinc-950 min-h-screen">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Mobile brand header */}
          <div className="flex lg:hidden flex-col items-center text-center space-y-3 mb-4">
            <Logo size={48} />
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-zinc-100 tracking-tight">NutriAI</h2>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">AI Nutrition Tracker</p>
            </div>
          </div>

          {/* Form container */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-100/40 dark:shadow-black/25 p-6 md:p-8 space-y-6">
            <div className="space-y-3">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase">
                <span className="text-emerald-600 dark:text-emerald-400">Step 1 of 2</span>
                <span className="text-gray-400 dark:text-zinc-500">Create Account &rarr; Profile Setup</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Create Your Account </h3>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Start tracking your nutrition with AI today</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Input
                  id="name"
                  type="text"
                  label="Full Name"
                  placeholder="John Doe"
                  autoComplete="name"
                  icon={<User className="w-4 h-4 text-gray-400 dark:text-zinc-500" />}
                  error={errors.name?.message}
                  {...register("name")}
                />
                <p className="text-[10px] text-gray-400 dark:text-zinc-500">Used for your personalized nutrition profile.</p>
              </div>

              <div className="space-y-1">
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  autoComplete="email"
                  icon={<Mail className="w-4 h-4 text-gray-400 dark:text-zinc-500" />}
                  error={errors.email?.message}
                  {...register("email")}
                />
                <p className="text-[10px] text-gray-400 dark:text-zinc-500">Used for account access and progress tracking.</p>
              </div>

              <div className="space-y-1">
                <Input
                  id="password"
                  type="password"
                  label="Password"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  icon={<Lock className="w-4 h-4 text-gray-400 dark:text-zinc-500" />}
                  error={errors.password?.message}
                  {...register("password")}
                />
                <p className="text-[10px] text-gray-400 dark:text-zinc-500">Minimum of 6 characters required.</p>
              </div>

              <div className="space-y-1">
                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  icon={<Lock className="w-4 h-4 text-gray-400 dark:text-zinc-500" />}
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
                <p className="text-[10px] text-gray-400 dark:text-zinc-500">Must match your password.</p>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 active:scale-[0.98] mt-2"
                size="lg"
                loading={loading}
              >
                Create My Account
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-gray-150 dark:bg-zinc-800 flex-1" />
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 tracking-wider uppercase">or continue with</span>
              <div className="h-px bg-gray-150 dark:bg-zinc-800 flex-1" />
            </div>

            {/* Google Button */}
            <GoogleButton mode="signup" />

            {/* Post signup info */}
            <div className="bg-emerald-500/[0.01] dark:bg-emerald-500/[0.02] border border-dashed border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl p-4 space-y-2">
              <h4 className="text-[11px] font-bold text-gray-900 dark:text-zinc-200 flex items-center gap-1.5">
                <span>✨</span> What Happens Next?
              </h4>
              <ol className="list-decimal list-inside text-[10px] text-gray-500 dark:text-zinc-400 space-y-1 leading-relaxed">
                <li>Complete your physical onboarding questionnaire</li>
                <li>Get automated metabolic calorie calculations</li>
                <li>Start logging meal photos for instant nutrition analysis</li>
              </ol>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-zinc-500 font-semibold">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-emerald-600 dark:text-emerald-450 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
