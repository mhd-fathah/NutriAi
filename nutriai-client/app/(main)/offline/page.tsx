"use client";

import Button from "@/components/shared/Button";
import Card from "@/components/shared/Card";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 py-12 transition-colors duration-300">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-100/40 dark:shadow-none rounded-3xl">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400">
          <WifiOff size={28} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight">
            No Internet Connection
          </h1>
          <p className="text-sm text-gray-550 dark:text-zinc-400 leading-relaxed">
            NutriAI is currently offline. You can still view pages you previously visited, or retry connecting.
          </p>
        </div>
        
        <Button
          onClick={handleRetry}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all"
        >
          Retry Connection
        </Button>
      </Card>
    </div>
  );
}
