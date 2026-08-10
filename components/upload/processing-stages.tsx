"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";

const STAGE_MESSAGES = [
  "Reading document...",
  "Extracting information...",
  "Analyzing content...",
  "Preparing results...",
];

const ROTATE_INTERVAL_MS = 2200;

/**
 * Rotates through honest, non-committal status text while a single request
 * is in flight. Deliberately does not render a fake percentage or a
 * checklist of "completed" steps we can't actually verify (PRD §47/§92).
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
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="text-sm font-medium text-foreground"
        >
          {STAGE_MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
