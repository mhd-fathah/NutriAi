"use client";

import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/utils";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Avoid hydration mismatch by rendering UI only after mounting on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 animate-pulse" />
    );
  }

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const CurrentIcon =
    theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800/80 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
        aria-label="Toggle theme"
      >
        <CurrentIcon size={18} className="transition-transform duration-300 rotate-0 scale-100" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-11 lg:bottom-auto lg:top-11 z-50 w-32 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl p-1.5 shadow-xl shadow-gray-100/40 dark:shadow-black/60 animate-fade-in space-y-0.5">
          {options.map(({ value, label, icon: Icon }) => {
            const active = theme === value;
            return (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer",
                  active
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-zinc-100"
                )}
              >
                <Icon size={14} className={cn(active ? "text-emerald-500" : "text-gray-400 dark:text-zinc-500")} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
