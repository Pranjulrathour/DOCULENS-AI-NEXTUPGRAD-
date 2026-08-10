const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function formatCurrency(value: number, currency?: string | null): string {
  const symbol = currency ? CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency} ` : "";
  return `${symbol}${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
