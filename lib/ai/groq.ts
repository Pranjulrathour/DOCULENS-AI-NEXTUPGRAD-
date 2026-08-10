import Groq from "groq-sdk";
import type { z } from "zod";
import { AppError } from "@/lib/errors/app-error";
import { getConfig } from "@/lib/config";
import type {
  AIProvider,
  ClassificationInput,
  ComparisonExplanationInput,
  ComplianceInput,
  ExtractionInput,
  SummaryInput,
} from "@/lib/ai/provider";
import { ClassificationResultSchema } from "@/lib/ai/schemas/common";
import { InvoiceExtractionV1Schema } from "@/lib/ai/schemas/invoice";
import { PurchaseOrderExtractionV1Schema } from "@/lib/ai/schemas/purchase-order";
import { ContractExtractionV1Schema } from "@/lib/ai/schemas/contract";
import { RegulatoryFilingExtractionV1Schema } from "@/lib/ai/schemas/regulatory-filing";
import { SummaryResultSchema } from "@/lib/ai/schemas/summary";
import { ComplianceEvaluationResultSchema } from "@/lib/ai/schemas/compliance";
import { ComparisonExplanationResultSchema } from "@/lib/ai/schemas/comparison-explanation";
import { CLASSIFICATION_SYSTEM_PROMPT, buildClassificationUserPrompt } from "@/lib/ai/prompts/classification";
import { INVOICE_EXTRACTION_SYSTEM_PROMPT, buildInvoiceExtractionUserPrompt } from "@/lib/ai/prompts/invoice-extraction";
import { PO_EXTRACTION_SYSTEM_PROMPT, buildPoExtractionUserPrompt } from "@/lib/ai/prompts/po-extraction";
import { CONTRACT_EXTRACTION_SYSTEM_PROMPT, buildContractExtractionUserPrompt } from "@/lib/ai/prompts/contract-extraction";
import { REGULATORY_EXTRACTION_SYSTEM_PROMPT, buildRegulatoryExtractionUserPrompt } from "@/lib/ai/prompts/regulatory-extraction";
import { SUMMARY_SYSTEM_PROMPT, buildSummaryUserPrompt } from "@/lib/ai/prompts/summary";
import { COMPLIANCE_SYSTEM_PROMPT, buildComplianceUserPrompt } from "@/lib/ai/prompts/compliance";
import { COMPARISON_EXPLANATION_SYSTEM_PROMPT, buildComparisonExplanationUserPrompt } from "@/lib/ai/prompts/comparison-explanation";

/** Bounded retry — PRD §61 explicitly forbids retry loops. */
const MAX_RATE_LIMIT_RETRIES = 1;

let client: Groq | null = null;
function getClient(): Groq {
  if (!client) client = new Groq({ apiKey: getConfig().GROQ_API_KEY });
  return client;
}

function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) return fenced[1];
  return trimmed;
}

async function completeJson<T>(
  schema: z.ZodType<T>,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<T> {
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= MAX_RATE_LIMIT_RETRIES) {
    try {
      const response = await getClient().chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const raw = response.choices[0]?.message?.content ?? "";
      let parsed: unknown;
      try {
        parsed = JSON.parse(extractJsonObject(raw));
      } catch (parseError) {
        throw new AppError("AI_OUTPUT_INVALID", {
          internalMessage: `JSON parse failed: ${parseError instanceof Error ? parseError.message : String(parseError)}. Raw: ${raw.slice(0, 500)}`,
        });
      }

      const validated = schema.safeParse(parsed);
      if (!validated.success) {
        throw new AppError("AI_OUTPUT_INVALID", {
          internalMessage: `Schema validation failed: ${validated.error.message}`,
        });
      }

      return validated.data;
    } catch (error) {
      lastError = error;
      const isRateLimit =
        error instanceof Groq.APIError && error.status === 429;

      if (isRateLimit && attempt < MAX_RATE_LIMIT_RETRIES) {
        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        continue;
      }

      if (isRateLimit) {
        throw new AppError("AI_RATE_LIMIT", { cause: error });
      }
      if (error instanceof AppError) throw error;
      throw new AppError("AI_REQUEST_FAILED", {
        internalMessage: error instanceof Error ? error.message : String(error),
        cause: error,
      });
    }
  }

  throw new AppError("AI_REQUEST_FAILED", { cause: lastError });
}

export class GroqProvider implements AIProvider {
  async classify(input: ClassificationInput) {
    const config = getConfig();
    return completeJson(
      ClassificationResultSchema,
      config.GROQ_FAST_MODEL,
      CLASSIFICATION_SYSTEM_PROMPT,
      buildClassificationUserPrompt(input.documentText),
    );
  }

  async extractInvoice(input: ExtractionInput) {
    const config = getConfig();
    return completeJson(
      InvoiceExtractionV1Schema,
      config.GROQ_FAST_MODEL,
      INVOICE_EXTRACTION_SYSTEM_PROMPT,
      buildInvoiceExtractionUserPrompt(input.documentText),
    );
  }

  async extractPurchaseOrder(input: ExtractionInput) {
    const config = getConfig();
    return completeJson(
      PurchaseOrderExtractionV1Schema,
      config.GROQ_FAST_MODEL,
      PO_EXTRACTION_SYSTEM_PROMPT,
      buildPoExtractionUserPrompt(input.documentText),
    );
  }

  async extractContract(input: ExtractionInput) {
    const config = getConfig();
    return completeJson(
      ContractExtractionV1Schema,
      config.GROQ_REASONING_MODEL,
      CONTRACT_EXTRACTION_SYSTEM_PROMPT,
      buildContractExtractionUserPrompt(input.documentText),
    );
  }

  async extractRegulatoryFiling(input: ExtractionInput) {
    const config = getConfig();
    return completeJson(
      RegulatoryFilingExtractionV1Schema,
      config.GROQ_REASONING_MODEL,
      REGULATORY_EXTRACTION_SYSTEM_PROMPT,
      buildRegulatoryExtractionUserPrompt(input.documentText),
    );
  }

  async summarize(input: SummaryInput) {
    const config = getConfig();
    return completeJson(
      SummaryResultSchema,
      config.GROQ_FAST_MODEL,
      SUMMARY_SYSTEM_PROMPT,
      buildSummaryUserPrompt(input.documentText, input.documentType),
    );
  }

  async evaluateCompliance(input: ComplianceInput) {
    const config = getConfig();
    return completeJson(
      ComplianceEvaluationResultSchema,
      config.GROQ_REASONING_MODEL,
      COMPLIANCE_SYSTEM_PROMPT,
      buildComplianceUserPrompt(input.documentText, input.rules),
    );
  }

  async explainComparison(input: ComparisonExplanationInput) {
    const config = getConfig();
    return completeJson(
      ComparisonExplanationResultSchema,
      config.GROQ_REASONING_MODEL,
      COMPARISON_EXPLANATION_SYSTEM_PROMPT,
      buildComparisonExplanationUserPrompt(input.computedComparisonJson),
    );
  }
}

let providerInstance: AIProvider | null = null;
export function getAIProvider(): AIProvider {
  if (!providerInstance) providerInstance = new GroqProvider();
  return providerInstance;
}
