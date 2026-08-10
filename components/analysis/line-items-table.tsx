import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InvoiceLineItem } from "@/lib/ai/schemas/invoice";
import { formatCurrency } from "@/lib/utils/format";

export function LineItemsTable({ lineItems, currency }: { lineItems: InvoiceLineItem[]; currency?: string | null }) {
  if (lineItems.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">Line Items</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Description</th>
              <th className="py-2 pr-4 font-medium">Qty</th>
              <th className="py-2 pr-4 font-medium">Unit Price</th>
              <th className="py-2 pr-4 font-medium">Tax</th>
              <th className="py-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index} className="border-b border-border/60 last:border-0">
                <td className="py-2 pr-4 text-foreground">{item.description ?? "Not found"}</td>
                <td className="py-2 pr-4 text-foreground">{item.quantity ?? "—"}</td>
                <td className="py-2 pr-4 text-foreground">
                  {item.unitPrice !== null ? formatCurrency(item.unitPrice, currency) : "—"}
                </td>
                <td className="py-2 pr-4 text-foreground">{item.taxRate !== null ? `${item.taxRate}%` : "—"}</td>
                <td className="py-2 font-medium text-foreground">
                  {item.total !== null ? formatCurrency(item.total, currency) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
