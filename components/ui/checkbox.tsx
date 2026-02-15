import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded-md border-2 border-blue-primary/30 dark:border-blue-primary/20 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-blue-primary data-[state=checked]:via-gold-500 data-[state=checked]:to-blue-primary data-[state=checked]:border-gold-500 data-[state=checked]:text-white transition-all duration-300 ease-out-smooth hover:scale-105 hover:border-gold-500/50 dark:hover:border-gold-500/40 data-[state=checked]:scale-105 data-[state=checked]:shadow-md data-[state=checked]:shadow-gold-500/30 dark:data-[state=checked]:shadow-gold-500/20 data-[state=checked]:animate-gold-glow will-change-transform gpu-accelerated",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
