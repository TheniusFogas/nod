/**
 * Senior Architecture: Shared Utilities
 */

/**
 * Formats a date string or Date object to a consistent human-readable format.
 * @param d Date input
 * @returns Formatted string (e.g., "1 April 2026") or empty string
 */
export function formatDate(d: any): string {
    if (!d) return "";
    try {
        const date = d instanceof Date ? d : new Date(d);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    } catch (e) {
        return "";
    }
}
