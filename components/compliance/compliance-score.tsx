"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import type { ComplianceOverallStatus } from "@/types/compliance";

const STATUS_CONFIG: Record<
  ComplianceOverallStatus,
  { label: string; ring: string; text: string; bg: string; glow: string }
> = {
  compliant: {
    label: "Compliant",
    ring: "stroke-success",
    text: "text-success",
    bg: "bg-success/10",
    glow: "0 0 24px rgba(5, 150, 105, 0.15)",
  },
  needs_review: {
    label: "Needs Review",
    ring: "stroke-warning",
    text: "text-warning",
    bg: "bg-warning/10",
    glow: "0 0 24px rgba(217, 119, 6, 0.15)",
  },
  non_compliant: {
    label: "Non-Compliant",
    ring: "stroke-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
    glow: "0 0 24px rgba(220, 38, 38, 0.15)",
  },
};

const RADIUS = 66;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Animated compliance score ring — mirrors MatchScore visual language. */
export function ComplianceScore({ score, status }: { score: number; status: ComplianceOverallStatus }) {
  const cfg = STATUS_CONFIG[status];
  const animatedScore = useSpring(0, { stiffness: 80, damping: 18 });
  const strokeDashoffset = useTransform(
    animatedScore,
    (value) => CIRCUMFERENCE * (1 - value / 100),
  );
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    animatedScore.set(score);
    const unsub = animatedScore.on("change", (v) => setDisplayScore(Math.round(v)));
    return unsub;
  }, [animatedScore, score]);

  const SIZE = 160;
  const CENTER = SIZE / 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center gap-4 py-4"
    >
      <div
        className={cn("relative flex items-center justify-center rounded-full", cfg.bg)}
        style={{ width: SIZE + 24, height: SIZE + 24, boxShadow: cfg.glow }}
      >
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90 absolute"
        >
          <circle
            cx={CENTER} cy={CENTER} r={RADIUS}
            className="stroke-border" strokeWidth="10" fill="none"
          />
          <motion.circle
            cx={CENTER} cy={CENTER} r={RADIUS}
            className={cfg.ring} strokeWidth="10" fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={{ strokeDashoffset }}
          />
        </svg>

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-4xl font-extrabold tabular-nums text-foreground leading-none">
            {displayScore}
            <span className="text-2xl font-bold">%</span>
          </span>
          <span className="text-xs text-muted-foreground mt-1 font-medium">compliance</span>
        </div>
      </div>

      <div className={cn("flex items-center gap-2 rounded-full px-4 py-1.5", cfg.bg)}>
        <div className={cn("w-2 h-2 rounded-full", cfg.ring.replace("stroke-", "bg-"))} />
        <p className={cn("text-sm font-bold", cfg.text)}>{cfg.label}</p>
      </div>
    </motion.div>
  );
}
