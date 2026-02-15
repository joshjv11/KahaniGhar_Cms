"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { playSound } from "@/lib/utils/sounds";
import { SoundType } from "@/lib/utils/sounds";

interface SoundButtonProps extends ButtonProps {
  soundType?: SoundType;
  playHoverSound?: boolean;
}

export function SoundButton({ 
  soundType = 'click', 
  playHoverSound = false,
  onClick,
  onMouseEnter,
  className,
  children,
  ...props 
}: SoundButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playSound(soundType);
    onClick?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playHoverSound) {
      playSound('hover');
    }
    onMouseEnter?.(e);
  };

  return (
    <Button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}
