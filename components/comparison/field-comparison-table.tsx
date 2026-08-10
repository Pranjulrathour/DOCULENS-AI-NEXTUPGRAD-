import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import type { FieldComparison } from "@/types/comparison";

export function FieldComparisonTable({ fields }: { fields: FieldComparison[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">Field Comparison</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Field</th>
              <th className="py-2 pr-4 font-medium">Invoice</th>
              <th className="py-2 pr-4 font-medium">PO</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.field} className="border-b border-border/60 last:border-0">
                <td className="py-2.5 pr-4 font-medium text-foreground">{field.label}</td>
                <td className="py-2.5 pr-4 text-foreground">{field.invoiceValue ?? "Not found"}</td>
                <td className="py-2.5 pr-4 text-foreground">{field.poValue ?? "Not found"}</td>
                <td className="py-2.5">
                  <StatusBadge status={field.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
