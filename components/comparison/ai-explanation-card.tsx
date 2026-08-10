import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompareResponse } from "@/types/api";

/** Labeled distinctly as "AI interpretation" — never presented as deterministic truth (PRD §31). */
export function AiExplanationCard({ explanation }: { explanation: NonNullable<CompareResponse["aiExplanation"]> }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          AI Interpretation
        </CardTitle>
        {explanation.materiallySignificant && <Badge variant="destructive">Materially Significant</Badge>}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground">{explanation.text}</p>
        {explanation.lineItemNotes.length > 0 && (
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {explanation.lineItemNotes.map((note, index) => (
              <li key={index}>
                {note.invoiceDescription ?? "—"} ↔ {note.poDescription ?? "—"}: {note.note}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs italic text-muted-foreground">{explanation.disclaimer}</p>
      </CardContent>
    </Card>
  );
}
