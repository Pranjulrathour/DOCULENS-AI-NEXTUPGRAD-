"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import type { ComparisonOverallStatus } from "@/types/comparison";

const STATUS_STYLES: Record<ComparisonOverallStatus, { label: string; ring: string; text: string }> = {
  strong_match: { label: "Strong Match", ring: "stroke-success", text: "text-success" },
  review: { label: "Review Required", ring: "stroke-warning", text: "text-warning" },
  poor_match: { label: "Poor Match", ring: "stroke-destructive", text: "text-destructive" },
};

const CIRCUMFERENCE = 2 * Math.PI * 54;

/** Score count-up + ring fill (PRD §46) — a one-time reveal, not a decorative loop. */
export function MatchScore({ score, status }: { score: number; status: ComparisonOverallStatus }) {
  const style = STATUS_STYLES[status];
  const animatedScore = useSpring(0, { stiffness: 90, damping: 20 });
  const strokeDashoffset = useTransform(animatedScore, (value) => CIRCUMFERENCE * (1 - value / 100));
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    animatedScore.set(score);
    const unsubscribe = animatedScore.on("change", (value) => setDisplayScore(Math.round(value)));
    return unsubscribe;
  }, [animatedScore, score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-3 py-4"
    >
      <div className="relative flex size-32 items-center justify-center">
        <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
          <circle cx="60" cy="60" r="54" className="stroke-border" strokeWidth="10" fill="none" />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            className={style.ring}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={{ strokeDashoffset }}
          />
        </svg>
        <span className="absolute text-3xl font-semibold text-foreground">{displayScore}%</span>
      </div>
      <p className={cn("text-sm font-semibold", style.text)}>{style.label}</p>
    </motion.div>
  );
}
