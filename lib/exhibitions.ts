export function getExhibitionStatus(startDate?: string | Date, endDate?: string | Date): "current" | "upcoming" | "past" {
    if (!startDate) return "current";

    const now = new Date();
    // Normalize to start of day for accurate comparison
    now.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    let end: Date | null = null;
    if (endDate) {
        end = new Date(endDate);
        // Set to end of day
        end.setHours(23, 59, 59, 999);
    }

    if (start > now) return "upcoming";
    if (end && end < now) return "past";
    return "current";
}
