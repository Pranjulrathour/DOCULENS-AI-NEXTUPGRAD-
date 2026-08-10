import mammoth from "mammoth";
import { AppError } from "@/lib/errors/app-error";
import type { DocumentTable } from "@/types/document";

export interface DocxExtractionResult {
  text: string;
  tables: DocumentTable[];
}

/** Very small HTML table parser scoped to mammoth's output — no external HTML parser needed. */
function extractTablesFromHtml(html: string): DocumentTable[] {
  const tables: DocumentTable[] = [];
  const tableMatches = html.matchAll(/<table[\s\S]*?<\/table>/g);
  for (const tableMatch of tableMatches) {
    const rows: string[][] = [];
    const rowMatches = tableMatch[0].matchAll(/<tr[\s\S]*?<\/tr>/g);
    for (const rowMatch of rowMatches) {
      const cells: string[] = [];
      const cellMatches = rowMatch[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g);
      for (const cellMatch of cellMatches) {
        cells.push(cellMatch[1].replace(/<[^>]+>/g, "").trim());
      }
      if (cells.length > 0) rows.push(cells);
    }
    if (rows.length > 0) tables.push({ rows });
  }
  return tables;
}

export async function extractDocx(buffer: Buffer): Promise<DocxExtractionResult> {
  try {
    const [textResult, htmlResult] = await Promise.all([
      mammoth.extractRawText({ buffer }),
      mammoth.convertToHtml({ buffer }),
    ]);
    return {
      text: textResult.value.replace(/\s+\n/g, "\n").trim(),
      tables: extractTablesFromHtml(htmlResult.value),
    };
  } catch (error) {
    throw new AppError("FILE_INVALID", {
      internalMessage: error instanceof Error ? error.message : String(error),
      cause: error,
    });
  }
}
