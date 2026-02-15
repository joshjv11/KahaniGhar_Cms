import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium transition-all duration-300 ease-out-smooth hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:ring-offset-2 will-change-transform gpu-accelerated",
  {
    variants: {
      variant: {
        default:
          "border-2 border-blue-primary/50 dark:border-blue-primary/40 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-900 dark:text-blue-100 hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-800/60 dark:hover:to-blue-700/60 shadow-md shadow-blue-primary/20 font-semibold",
        secondary:
          "border-2 border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700 font-medium",
        destructive:
          "border-2 border-red-400 dark:border-red-600 bg-red-200 dark:bg-red-900/40 text-red-900 dark:text-red-100 hover:bg-red-300 dark:hover:bg-red-800/50 font-semibold",
        outline: "text-slate-900 dark:text-slate-100 border-2 border-blue-primary/40 dark:border-blue-primary/30 bg-blue-50/50 dark:bg-blue-950/30 hover:border-gold-500/60 dark:hover:border-gold-500/50 hover:bg-gold-50/50 dark:hover:bg-gold-950/20 font-medium",
        premium: "border-2 border-gold-500/60 dark:border-gold-500/50 bg-gradient-to-r from-gold-200 to-gold-300 dark:from-gold-900/40 dark:to-gold-800/40 text-gold-900 dark:text-gold-100 font-bold animate-gold-pulse shadow-md shadow-gold-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
