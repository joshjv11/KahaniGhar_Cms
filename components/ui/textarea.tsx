import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border-2 border-blue-primary/30 dark:border-blue-primary/20 bg-white/90 dark:bg-navy/90 backdrop-blur-md px-4 py-3 text-sm ring-offset-background placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)] focus-visible:border-gold-500 dark:focus-visible:border-gold-400 focus-visible:shadow-xl focus-visible:shadow-gold-500/40 dark:focus-visible:shadow-gold-500/30 focus-visible:scale-[1.02] hover:border-blue-primary/60 dark:hover:border-blue-primary/50 hover:shadow-md hover:shadow-blue-primary/20 dark:hover:shadow-blue-primary/10 gpu-accelerated",
        className
      )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
