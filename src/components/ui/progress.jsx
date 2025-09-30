

// Progress.jsx
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const getProgressColor = (value, overLimit = false) => {
  if (overLimit) return "bg-red-600";          // Overspent
  if (value >= 90) return "bg-green-500";      // Excellent
  if (value >= 70) return "bg-blue-500";       // Good
  if (value >= 40) return "bg-yellow-500";     // Moderate
  if (value > 0) return "bg-orange-500";       // Low
  return "bg-gray-300";                        // No progress
};

// Color logic for budget usage
const getBudgetColor = (value, overLimit = false) => {
  if (overLimit) return "bg-red-700";          // Over budget
  if (value >= 90) return "bg-red-500";        // Very high usage
  if (value >= 70) return "bg-orange-500";     // High usage
  if (value >= 40) return "bg-yellow-500";     // Moderate
  if (value > 0) return "bg-green-500";        // Safe / low usage
  return "bg-green-200";                       // No spending yet
};
const Progress = React.forwardRef(
  (
    { className, value = 0, showLabel = false, animated = true, spent, budget, mode, ...props },
    ref
  ) => {
    // If spent/budget are given, calculate percentage
    let progress = value;
    let overLimit = false;

    if (typeof spent === "number" && typeof budget === "number" && budget > 0) {
      progress = Math.min((spent / budget) * 100, 100);
      overLimit = spent > budget;
    }

    const colorClass = 
      mode === "budget" 
        ? getBudgetColor(progress, overLimit) 
        : getProgressColor(progress, overLimit);

    return (
      <div className="relative w-full">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            "relative h-3 w-full overflow-hidden rounded-full bg-muted",
            className
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full flex-1 transition-all duration-500 ease-in-out",
              animated ? "animate-pulse-slow" : "",
              colorClass
            )}
            style={{ transform: `translateX(-${100 - progress}%)` }}
          />
        </ProgressPrimitive.Root>

        {showLabel && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    );
  }
);

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
