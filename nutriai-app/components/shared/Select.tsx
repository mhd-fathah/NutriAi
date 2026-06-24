import { cn } from "@/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-zinc-350">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              "w-full appearance-none rounded-xl border bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-gray-900 dark:text-zinc-100",
              "transition-all duration-200 outline-none pr-10",
              "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/10",
              "disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-zinc-950",
              error
                ? "border-red-400 dark:border-red-500/50 focus:border-red-400 focus:ring-red-400/20"
                : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="dark:bg-zinc-900">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="dark:bg-zinc-900">
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
