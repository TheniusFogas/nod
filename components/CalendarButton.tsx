"use client";

export function CalendarButton({ title, startDate, endDate, description, locName, locAddr }: { title: string, startDate: any, endDate: any, description: string, locName: string, locAddr: string }) {
    if (!title) return null;

    const toSafeISO = (d: any) => {
        try {
            if (!d) return "";
            const date = new Date(d);
            if (isNaN(date.getTime())) return "";
            return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        } catch (e) { return ""; }
    };

    const start = toSafeISO(startDate);
    const end = toSafeISO(endDate);
    const details = description || "";

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(locName + locAddr)}`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline"
            style={{ fontSize: "0.7rem", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Add to Calendar
        </a>
    );
}
