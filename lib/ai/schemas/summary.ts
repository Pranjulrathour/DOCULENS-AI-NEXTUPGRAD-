import { z } from "zod";

export const SummaryResultSchema = z.object({
  bullets: z.array(z.string()).min(1).max(6),
});
export type SummaryResult = z.infer<typeof SummaryResultSchema>;
