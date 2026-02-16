"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { playSound, SoundType } from "@/lib/utils/sounds";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#FFB800] text-slate-950 hover:bg-[#FFB800]/90 font-bold shadow-[0_0_15px_rgba(255,184,0,0.3)] hover:shadow-[0_0_20px_rgba(255,184,0,0.4)]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-white/20 bg-transparent text-foreground hover:bg-white/5 hover:border-white/30",
        secondary:
          "bg-white/10 text-foreground hover:bg-white/15 border border-white/10",
        ghost: "hover:bg-white/5 text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
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
