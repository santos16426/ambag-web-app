/**
 * Currency configuration and formatting utilities
 * This will be moved to user settings in the future
 */

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  position: "before" | "after";
};

// Default currency - will be moved to user settings
export const DEFAULT_CURRENCY: Currency = {
  code: "PHP",
  symbol: "₱",
  name: "Philippine Peso",
  position: "before",
};

/**
 * Format a number as currency with comma separators
 */
export function formatCurrency(
  amount: number,
  currency: Currency = DEFAULT_CURRENCY,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });

  return currency.position === "before"
    ? `${currency.symbol}${formatted}`
    : `${formatted} ${currency.symbol}`;
}

/**
 * Format a number with comma separators (without currency symbol)
 */
export function formatNumber(amount: number, decimals: number = 2): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
