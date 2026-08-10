"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Subtle result-card entrance (PRD §46) — one-time reveal, not a decorative loop. */
export function FadeIn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
