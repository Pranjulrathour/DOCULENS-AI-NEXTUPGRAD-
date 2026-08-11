"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const STAGE_MESSAGES = [
  "Reading document...",
  "Extracting information...",
  "Analyzing content...",
  "Preparing results...",
];

const ROTATE_INTERVAL_MS = 2200;

/**
 * Rotates through honest, non-committal status text while a single request
 * is in flight. Does not render a fake percentage or a checklist of
 * "completed" steps we can't actually verify.
 */
export function ProcessingStages() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => Math.min(i + 1, STAGE_MESSAGES.length - 1));
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16">
      {/* Gradient spinner */}
      <div className="relative">
        <svg className="size-12 animate-spin" viewBox="0 0 48 48" fill="none">
          <circle
            cx="24" cy="24" r="20"
            stroke="currentColor"
            strokeWidth="4"
            className="text-border"
          />
          <circle
            cx="24" cy="24" r="20"
            stroke="url(#spinner-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="80"
            strokeDashoffset="55"
          />
          <defs>
            <linearGradient id="spinner-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#315CF6" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.22 }}
          className="text-center"
        >
          <p className="text-sm font-semibold text-foreground">{STAGE_MESSAGES[index]}</p>
          <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {STAGE_MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-500 ${
              i <= index
                ? "w-4 h-1.5 gradient-brand"
                : "w-1.5 h-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
