export type SupportedMimeType =
  | "application/pdf"
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "text/plain";

export type SupportedExtension =
  | ".pdf"
  | ".png"
  | ".jpg"
  | ".jpeg"
  | ".webp"
  | ".docx"
  | ".xlsx"
  | ".txt";

export interface DocumentPage {
  pageNumber: number;
  text?: string;
  imageBase64?: string;
  width?: number;
  height?: number;
}

export interface DocumentTable {
  pageNumber?: number;
  rows: string[][];
}

export interface DocumentMetadata {
  createdAt: string;
  sourceType: "upload";
  parser: string;
  requiredOcr: boolean;
}

export interface NormalizedDocument {
  id: string;
  fileName: string;
  mimeType: SupportedMimeType;
  sizeBytes: number;
  pageCount?: number;
  text: string;
  pages?: DocumentPage[];
  tables?: DocumentTable[];
  metadata: DocumentMetadata;
}
