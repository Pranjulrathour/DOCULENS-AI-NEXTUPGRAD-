export type ComparisonStatus =
  | "match"
  | "mismatch"
  | "warning"
  | "missing"
  | "not_applicable";

export interface FieldComparison {
  field: string;
  label: string;
  invoiceValue: string | number | null;
  poValue: string | number | null;
  status: ComparisonStatus;
  difference?: number;
  variancePercent?: number;
}

export interface LineItemComparison {
  invoiceDescription: string | null;
  poDescription: string | null;
  quantity: FieldComparison;
  unitPrice: FieldComparison;
  taxRate: FieldComparison;
  total: FieldComparison;
  aiMatchNote?: string;
}

export type ComparisonOverallStatus = "strong_match" | "review" | "poor_match";

export interface ComparisonResult {
  score: number;
  status: ComparisonOverallStatus;
  fieldComparisons: FieldComparison[];
  lineItemComparisons: LineItemComparison[];
  summary: string[];
  aiExplanation?: {
    text: string;
    disclaimer: string;
  };
}
