import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border-2 border-blue-primary/50 dark:border-blue-primary/40",
      "bg-gradient-to-br from-white via-blue-100/40 to-gold-100/30 dark:from-navy dark:via-blue-900/60 dark:to-gold-900/30",
      "backdrop-blur-md shadow-lg",
      "text-card-foreground shadow-md",
      "transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
      "hover:-translate-y-3 hover:shadow-2xl",
      "hover:shadow-gold-500/40 dark:hover:shadow-gold-500/30",
      "hover:border-gold-500/70 dark:hover:border-gold-500/60",
      "hover:scale-[1.03]",
      "hover:animate-gold-glow",
      "motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-sm motion-reduce:hover:scale-100",
      "gpu-accelerated",
      "backdrop-blur-md",
      "relative overflow-hidden",
      "before:absolute before:inset-0 before:border-2 before:border-transparent",
      "hover:before:border-gold-500/30 hover:before:animate-gold-border",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
