/**
 * Shared date formatting utilities
 */

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @param mounted - Whether component is mounted (for SSR)
 * @returns Formatted date string or empty string
 */
export function formatTransactionDate(dateString: string | null | undefined, mounted: boolean): string {
  if (!mounted || !dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
