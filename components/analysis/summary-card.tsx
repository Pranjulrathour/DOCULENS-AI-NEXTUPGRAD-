import { AlignLeft } from "lucide-react";

export function SummaryCard({ bullets }: { bullets: string[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center">
          <AlignLeft className="size-3.5 text-muted-foreground" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Summary
        </p>
      </div>
      <ul className="space-y-2.5">
        {bullets.map((bullet, index) => (
          <li key={index} className="flex gap-3 text-sm text-foreground leading-relaxed">
            <span
              className="mt-2 size-1.5 shrink-0 rounded-full gradient-brand"
              aria-hidden="true"
            />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}
