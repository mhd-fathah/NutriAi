import { cn } from "@/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  className,
  glass = false,
  hover = false,
  padding = "md",
  children,
  ...props
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm dark:shadow-none",
        glass
          ? "bg-white/75 dark:bg-zinc-900/75 backdrop-blur-sm"
          : "bg-white dark:bg-zinc-900",
        hover && "hover:shadow-md dark:hover:shadow-none hover:-translate-y-0.5 transition-all duration-200 cursor-pointer",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
