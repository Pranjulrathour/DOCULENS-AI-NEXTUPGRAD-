export interface SourceReference {
  page?: number;
  text?: string;
}

export interface Issue {
  id: string;
  severity: "info" | "warning" | "error";
  title: string;
  description: string;
  source?: SourceReference;
}
