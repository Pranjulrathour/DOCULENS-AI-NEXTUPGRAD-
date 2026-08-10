import { z } from "zod";

const EnvSchema = z.object({
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
  GROQ_FAST_MODEL: z.string().min(1),
  GROQ_REASONING_MODEL: z.string().min(1),
  GROQ_VISION_MODEL: z.string().min(1),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(20),
  MAX_IMAGE_DIMENSION: z.coerce.number().positive().default(2000),
  AMOUNT_TOLERANCE_PERCENT: z.coerce.number().min(0).default(1),
  QUANTITY_TOLERANCE: z.coerce.number().min(0).default(0),
});

/** Lazily validated so a missing GROQ_API_KEY only fails requests that need AI, not every route. */
let cached: z.infer<typeof EnvSchema> | null = null;

export function getConfig() {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.issues.map((i) => i.path.join(".") + ": " + i.message).join("; ")}`,
    );
  }
  cached = parsed.data;
  return cached;
}
