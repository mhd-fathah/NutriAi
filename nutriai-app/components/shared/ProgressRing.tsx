"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/utils";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  sublabel?: string;
  className?: string;
  animate?: boolean;
}

export default function ProgressRing({
  percentage,
  size = 160,
  strokeWidth = 12,
  color = "#10B981",
  bgColor = "#E5E7EB",
  label,
  sublabel,
  className,
  animate = true,
}: ProgressRingProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedPercentage / 100) * circumference;

  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!animate || !circleRef.current) return;
    circleRef.current.style.strokeDashoffset = String(circumference);
    const timeout = setTimeout(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = "stroke-dashoffset 1s ease-in-out";
        circleRef.current.style.strokeDashoffset = String(offset);
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [circumference, offset, animate]);

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : offset}
          style={
            animate
              ? undefined
              : { strokeDashoffset: offset }
          }
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {label && (
          <span className="text-2xl font-bold text-gray-900 leading-none">{label}</span>
        )}
        {sublabel && (
          <span className="text-xs text-gray-500 mt-1">{sublabel}</span>
        )}
        <span className="text-sm font-semibold text-emerald-600 mt-0.5">
          {clampedPercentage}%
        </span>
      </div>
    </div>
  );
}
