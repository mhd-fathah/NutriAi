import React from "react";
import { cn } from "@/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className, size = 32 }: LogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center flex-shrink-0", className)} style={{ width: size, height: size }}>
      {/* Glow highlight */}
      <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-md scale-95" />
      
      {/* SVG Icon */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        {/* Rounded square container backdrop */}
        <rect width="100" height="100" rx="28" fill="url(#logoGradient)" />
        
        {/* Custom N-Leaf design */}
        <path
          d="M32 70V30C32 25 36 22 40 22C44 22 50 26 56 34L68 50C72 55 72 65 68 70C64 75 56 78 50 78C42 78 32 74 32 70Z"
          fill="white"
          fillOpacity="0.15"
        />
        
        {/* Healthy leaf shape merged with nodes */}
        <path
          d="M50 24C34 24 30 42 34 58C36 66 42 72 50 76C58 72 64 66 66 58C70 42 66 24 50 24ZM50 70C46 64 42 56 42 48C42 40 46 32 50 30C54 32 58 40 58 48C58 56 54 64 50 70Z"
          fill="white"
        />
      </svg>
    </div>
  );
}
