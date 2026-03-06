"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const sections = [
    {
        label: "Content",
        links: [
            { href: "/admin", label: "Dashboard", icon: "◈" },
            { href: "/admin/settings", label: "Settings", icon: "⚙" },
            { href: "/admin/exhibitions", label: "Exhibitions", icon: "◻" },
            { href: "/admin/media", label: "Media Library", icon: "🖼" },
            { href: "/admin/open-calls", label: "Open Calls", icon: "◷" },
            { href: "/admin/news", label: "News", icon: "◈" },
        ],
    },
    {
        label: "People",
        links: [
            { href: "/admin/artists", label: "Artists", icon: "◈" },
            { href: "/admin/artists/database", label: "Artist Database", icon: "👥" },
            { href: "/admin/team", label: "Team", icon: "◈" },
            { href: "/admin/sponsors", label: "Sponsors", icon: "◈" },
        ],
    },
    {
        label: "Communication",
        links: [
            { href: "/admin/newsletter", label: "Newsletter", icon: "✉" },
            { href: "/admin/messages", label: "Messages", icon: "◈" },
        ],
    },
];

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar__logo">NOD FLOW</div>

            {sections.map((section) => (
                <div key={section.label}>
                    <div className="admin-sidebar__section">{section.label}</div>
                    {section.links.map((link) => {
                        const isActive = link.href === "/admin"
                            ? pathname === "/admin"
                            : pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`admin-nav-link ${isActive ? "active" : ""}`}
                            >
                                <span>{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            ))}

            <div style={{ marginTop: "auto", padding: "24px 28px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <Link href="/" style={{ display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
                    ← View Site
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: "/admin/login" })}
                    style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", cursor: "pointer", transition: "color 0.3s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                >
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
