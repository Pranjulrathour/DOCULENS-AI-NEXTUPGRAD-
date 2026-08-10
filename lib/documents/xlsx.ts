import * as XLSX from "xlsx";
import { AppError } from "@/lib/errors/app-error";
import type { DocumentTable } from "@/types/document";

export interface XlsxExtractionResult {
  text: string;
  tables: DocumentTable[];
}

/**
 * Converts each sheet into a structured row/cell table and a compact text
 * rendering for the AI prompt. Workbook metadata (styles, defined names,
 * etc.) is intentionally discarded — PRD §18 forbids sending it to the AI.
 */
export function extractXlsx(buffer: Buffer): XlsxExtractionResult {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const tables: DocumentTable[] = [];
    const textSections: string[] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows: string[][] = XLSX.utils.sheet_to_json<string[]>(sheet, {
        header: 1,
        blankrows: false,
        defval: "",
      });
      const stringRows = rows.map((row) => row.map((cell) => String(cell ?? "")));
      if (stringRows.length === 0) continue;

      tables.push({ rows: stringRows });
      const rendered = stringRows.map((row) => row.join(" | ")).join("\n");
      textSections.push(`[Sheet: ${sheetName}]\n${rendered}`);
    }

    return { text: textSections.join("\n\n"), tables };
  } catch (error) {
    throw new AppError("FILE_INVALID", {
      internalMessage: error instanceof Error ? error.message : String(error),
      cause: error,
    });
  }
}
