import type { ComplianceRule, ComplianceRuleResult } from "@/types/compliance";

export function parseRulesFromText(raw: string): ComplianceRule[] {
  return raw
    .split("\n")
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter((line) => line.length > 0)
    .map((text, index) => ({ id: `rule_${index + 1}`, text }));
}

const PAYMENT_TERMS_DAY_LIMIT = /(?:payment terms?.*?(?:not exceed|within|no more than|max(?:imum)?)|within)\s*(\d+)\s*days?/i;
const NET_DAYS_IN_TEXT = /net\s*(\d+)/i;

/** "<document> must contain <field>" — the object of "contain" is what must be present. */
const MUST_CONTAIN = /must (?:contain|include)\s+(?:an?\s+|the\s+)?(.+?)[.\s]*$/i;
/** "<field> must be present/included" or "<field> is required" — the subject is what must be present. */
const SUBJECT_MUST_BE_PRESENT = /^(?:the\s+)?(.+?)\s+(?:must be present|is required|should be present|must be included)/i;

/**
 * Attempts a fully deterministic evaluation of a rule against the document's
 * plain text. Returns null when the rule requires semantic judgment the AI
 * must provide instead (PRD §34 — never use AI where code is enough, but
 * never fake determinism where code genuinely can't decide).
 */
export function evaluateRuleDeterministically(
  rule: ComplianceRule,
  documentText: string,
): ComplianceRuleResult | null {
  const dayLimitMatch = rule.text.match(PAYMENT_TERMS_DAY_LIMIT);
  if (dayLimitMatch) {
    const limit = Number(dayLimitMatch[1]);
    const netMatch = documentText.match(NET_DAYS_IN_TEXT);
    if (!netMatch) return null; // no "Net N" found — let AI interpret free-text payment terms
    const actualDays = Number(netMatch[1]);
    const pass = actualDays <= limit;
    return {
      rule: rule.text,
      status: pass ? "pass" : "fail",
      reason: pass
        ? `Payment terms are Net ${actualDays}, within the ${limit}-day limit.`
        : `Payment terms are Net ${actualDays}, exceeding the ${limit}-day limit.`,
      evidence: netMatch[0],
      confidence: 1,
    };
  }

  const presenceMatch = rule.text.match(MUST_CONTAIN) ?? rule.text.match(SUBJECT_MUST_BE_PRESENT);
  if (presenceMatch) {
    return evaluateFieldPresence(rule.text, presenceMatch[1], documentText);
  }

  return null;
}

function evaluateFieldPresence(
  ruleText: string,
  fieldPhraseRaw: string,
  documentText: string,
): ComplianceRuleResult | null {
  const fieldPhrase = fieldPhraseRaw.toLowerCase().trim();
  const keywords = fieldPhrase
    .replace(/^(a|an|the)\s+/, "")
    .split(/\s+/)
    .filter((word) => word.length > 2);

  if (keywords.length === 0) return null; // nothing concrete to check — defer to AI

  const lowerText = documentText.toLowerCase();
  // Require every keyword in the phrase, not just any one — "gst number" shouldn't
  // pass on a document that merely contains the unrelated word "number".
  const present = keywords.every((keyword) => lowerText.includes(keyword));

  return {
    rule: ruleText,
    status: present ? "pass" : "fail",
    reason: present
      ? `Found a reference to "${fieldPhrase}" in the document.`
      : `No reference to "${fieldPhrase}" was found in the document.`,
    evidence: present ? fieldPhrase : null,
    confidence: 0.85,
  };
}
