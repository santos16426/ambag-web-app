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

/**
 * Available currencies list
 */
export const CURRENCIES: Currency[] = [
  { code: "PHP", symbol: "₱", name: "Philippine Peso", position: "before" },
  { code: "USD", symbol: "$", name: "US Dollar", position: "before" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", position: "before" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", position: "before" },
  { code: "EUR", symbol: "€", name: "Euro", position: "before" },
  { code: "GBP", symbol: "£", name: "British Pound", position: "before" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", position: "before" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", position: "before" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", position: "before" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", position: "before" },
];

/**
 * Format currency input value for display in input fields
 * Formats numeric input with currency symbol and comma separators
 */
export function formatCurrencyInput(value: string, currency: Currency = DEFAULT_CURRENCY): string {
  const numericValue = value.replace(/[^\d.]/g, "");
  if (!numericValue || numericValue === ".") return "";
  const parts = numericValue.split(".");
  const integerPart = parts[0] || "0";
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let formattedValue = formattedInteger;
  if (currency.code === "JPY") {
    formattedValue = formattedInteger;
  } else if (parts.length > 1) {
    const decimalPart = parts[1].slice(0, 2);
    formattedValue = `${formattedInteger}.${decimalPart}`;
  }
  return currency.position === "before"
    ? `${currency.symbol}${formattedValue}`
    : `${formattedValue} ${currency.symbol}`;
}