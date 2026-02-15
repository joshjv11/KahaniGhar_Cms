"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { playSound, SoundType } from "@/lib/utils/sounds";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.05] hover:shadow-xl hover:-translate-y-1 active:scale-[0.97] active:translate-y-0 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:hover:translate-y-0 gpu-accelerated",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-primary via-gold-500 to-blue-primary text-white hover:from-blue-primary hover:via-gold-600 hover:to-gold-700 hover:shadow-2xl hover:shadow-gold-500/50 dark:hover:shadow-gold-500/40 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 before:ease-out-smooth",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-xl hover:shadow-red-500/30",
        outline:
          "border-2 border-blue-primary/40 dark:border-blue-primary/30 bg-white/90 dark:bg-navy/90 backdrop-blur-sm text-slate-900 dark:text-slate-100 hover:bg-gradient-to-r hover:from-blue-100 hover:via-gold-100/50 hover:to-blue-100 dark:hover:from-blue-950/30 dark:hover:via-gold-950/20 dark:hover:to-blue-950/30 hover:border-gold-500/60 dark:hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/20 dark:hover:shadow-gold-500/10 font-semibold",
        secondary:
          "bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 text-slate-900 dark:text-slate-100 hover:from-blue-200 hover:to-gold-200 dark:hover:from-blue-900/50 dark:hover:to-gold-900/30 hover:shadow-lg font-semibold",
        ghost: "hover:bg-gradient-to-r hover:from-blue-50 hover:via-gold-50/30 hover:to-blue-50 dark:hover:from-blue-950/30 dark:hover:via-gold-950/20 dark:hover:to-blue-950/30 hover:text-blue-700 dark:hover:text-gold-400",
        link: "text-blue-primary dark:text-blue-400 underline-offset-4 hover:text-gold-500 dark:hover:text-gold-400 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  soundType?: SoundType;
  playHoverSound?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, soundType, playHoverSound = false, onClick, onMouseEnter, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (soundType) {
        playSound(soundType);
      } else if (variant === 'destructive') {
        playSound('delete');
      } else if (variant === 'default') {
        playSound('save');
      } else {
        playSound('click');
      }
      onClick?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (playHoverSound) {
        playSound('hover');
      }
      onMouseEnter?.(e);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
