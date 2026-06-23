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
        "rounded-2xl border border-gray-100 shadow-sm",
        glass
          ? "bg-white/75 backdrop-blur-sm"
          : "bg-white",
        hover && "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
