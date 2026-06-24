"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/utils";

interface GoogleButtonProps {
  mode: "signin" | "signup";
  className?: string;
}

export default function GoogleButton({ mode, className }: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // In NextAuth v5, client-side signIn("google") triggers the OAuth flow.
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error("Unable to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleGoogleLogin}
      className={cn(
        "flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold text-gray-700 dark:text-zinc-300 shadow-sm dark:shadow-none",
        "hover:bg-gray-50 dark:hover:bg-zinc-800 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none transition-all duration-300 active:scale-[0.98] cursor-pointer",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-sm",
        className
      )}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span>{mode === "signin" ? "Continue with Google" : "Sign up with Google"}</span>
    </button>
  );
}
