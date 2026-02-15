"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionWrapperProps {
  children: ReactNode;
}

export function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  return (
    <motion.main
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        duration: 0.3,
        ease: [0.45, 0, 0.55, 1], // ease-in-out-quad
      }}
      className="flex-1 ml-64 min-h-[calc(100vh-73px)] bg-[#F9FAFB]"
    >
      {children}
    </motion.main>
  );
}
