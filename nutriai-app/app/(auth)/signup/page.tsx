"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { RegisterSchema, RegisterInput } from "@/lib/validations";
import { registerUser } from "@/actions/auth.actions";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { Mail, Lock, User } from "lucide-react";

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
      const result = await registerUser(data);
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
    <div className="glass rounded-3xl border border-white/80 shadow-xl shadow-emerald-500/5 p-8 animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-sm text-gray-500 mt-1">Start tracking your nutrition with AI today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="name"
          type="text"
          label="Full Name"
          placeholder="John Doe"
          autoComplete="name"
          icon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Min. 6 characters"
          autoComplete="new-password"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          icon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
