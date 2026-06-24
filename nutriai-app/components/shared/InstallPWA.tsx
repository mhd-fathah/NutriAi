"use client";

import { useEffect, useState } from "react";
import { Download, X, Share2, PlusSquare } from "lucide-react";
import Button from "./Button";
import { cn } from "@/utils";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / standalone
    const isStandaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // 2. Check if user dismissed recently (wait 3 days before showing again)
    const lastDismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (lastDismissed) {
      const daysPassed = (Date.now() - Number(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysPassed < 3) return;
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/crios|fxios|opera|twitter|fbios|focus/.test(userAgent);
    setIsIOS(isIOSDevice && isSafari);

    if (isIOSDevice && isSafari) {
      // Show iOS prompt after 5 seconds delay
      const timer = setTimeout(() => setShowBanner(true), 5000);
      return () => clearTimeout(timer);
    }

    // 4. Detect Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt banner after a slight delay
      const timer = setTimeout(() => setShowBanner(true), 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted PWA installation");
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-prompt-dismissed", String(Date.now()));
  };

  // 5. Register Service Worker on client mount
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("Service Worker registered successfully with scope:", registration.scope);
          },
          (err) => {
            console.error("Service Worker registration failed:", err);
          }
        );
      });
    }
  }, []);

  if (isStandalone || !showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:right-6 md:left-auto z-50 max-w-sm w-full animate-fade-in-up">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-2xl shadow-gray-200/50 dark:shadow-black/70 flex flex-col gap-4 relative overflow-hidden">
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 flex items-center justify-center transition-all cursor-pointer"
        >
          <X size={12} />
        </button>

        {isIOS ? (
          // iOS Safari specific guide banner
          <div className="space-y-3">
            <div className="flex gap-3 items-start pr-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Share2 size={18} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-150">Install NutriAI</h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Add to home screen from Safari browser.</p>
              </div>
            </div>
            
            <div className="border-t border-gray-50 dark:border-zinc-800/80 pt-3 text-[11px] text-gray-500 dark:text-zinc-400 space-y-1.5 pl-1 leading-relaxed">
              <p className="flex items-center gap-1.5">
                1. Tap the <Share2 size={12} className="inline text-emerald-500" /> Share button in Safari menu.
              </p>
              <p className="flex items-center gap-1.5">
                2. Select <PlusSquare size={12} className="inline text-emerald-500" /> &quot;Add to Home Screen&quot;.
              </p>
            </div>
          </div>
        ) : (
          // Android / Chrome / Edge Install Banner
          <div className="space-y-3">
            <div className="flex gap-3 items-start pr-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Download size={18} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-150">Install NutriAI</h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Track meals faster from your home screen.</p>
              </div>
            </div>

            <div className="flex gap-2 pt-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="flex-1 text-xs py-2 rounded-xl border-gray-100 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                Maybe Later
              </Button>
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="flex-1 text-xs py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold"
              >
                Install App
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
