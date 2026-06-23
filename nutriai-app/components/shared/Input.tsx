import { cn } from "@/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400",
              "transition-all duration-200 outline-none",
              "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
              "disabled:opacity-50 disabled:bg-gray-50",
              error
                ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                : "border-gray-200 hover:border-gray-300",
              icon ? "pl-10" : "",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
