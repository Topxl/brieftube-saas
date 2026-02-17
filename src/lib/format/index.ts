export * from "./date";
export * from "./id";

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
): { formatted: string; symbol: string } {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100); // Assuming amount is in cents

  // Extract symbol and number
  const parts = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).formatToParts(amount / 100);

  const symbol =
    parts.find((part) => part.type === "currency")?.value ?? currency;
  const numberPart = formatted.replace(symbol, "").trim();

  return { formatted: numberPart, symbol };
}
