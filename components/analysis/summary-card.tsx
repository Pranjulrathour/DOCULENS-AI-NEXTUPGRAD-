import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SummaryCard({ bullets }: { bullets: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {bullets.map((bullet, index) => (
            <li key={index} className="flex gap-2 text-sm text-foreground">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              {bullet}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
