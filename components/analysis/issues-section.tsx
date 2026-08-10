import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Issue } from "@/types/issue";

const SEVERITY_CONFIG = {
  info: { icon: Info, className: "text-primary bg-primary/10" },
  warning: { icon: AlertTriangle, className: "text-warning bg-warning/10" },
  error: { icon: AlertCircle, className: "text-destructive bg-destructive/10" },
} as const;

export function IssuesSection({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">Findings & Warnings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {issues.map((issue) => {
          const config = SEVERITY_CONFIG[issue.severity];
          const Icon = config.icon;
          return (
            <div key={issue.id} className="flex gap-3 rounded-md border border-border p-3">
              <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", config.className)}>
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{issue.title}</p>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
