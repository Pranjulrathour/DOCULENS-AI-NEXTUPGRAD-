import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import type { LineItemComparison } from "@/types/comparison";

export function LineItemComparisonTable({ items }: { items: LineItemComparison[] }) {
  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">Line-Item Comparison</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Invoice Item</th>
              <th className="py-2 pr-4 font-medium">PO Item</th>
              <th className="py-2 pr-4 font-medium">Qty</th>
              <th className="py-2 pr-4 font-medium">Unit Price</th>
              <th className="py-2 pr-4 font-medium">Tax</th>
              <th className="py-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-border/60 last:border-0">
                <td className="py-2.5 pr-4 text-foreground">{item.invoiceDescription ?? "Not found"}</td>
                <td className="py-2.5 pr-4 text-foreground">{item.poDescription ?? "Not found"}</td>
                <td className="py-2.5 pr-4"><StatusBadge status={item.quantity.status} /></td>
                <td className="py-2.5 pr-4"><StatusBadge status={item.unitPrice.status} /></td>
                <td className="py-2.5 pr-4"><StatusBadge status={item.taxRate.status} /></td>
                <td className="py-2.5"><StatusBadge status={item.total.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
