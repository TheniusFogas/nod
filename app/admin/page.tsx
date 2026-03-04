"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        exhibitions: 0, artists: 0, openCalls: 0,
        subscribers: 0, messages: 0,
    });

    useEffect(() => {
        async function load() {
            const [ex, art, oc, sub, msg] = await Promise.all([
                fetch("/api/exhibitions").then((r) => r.json()),
                fetch("/api/artists").then((r) => r.json()),
                fetch("/api/open-calls").then((r) => r.json()),
                fetch("/api/newsletter").then((r) => r.json()),
                fetch("/api/contact").then((r) => r.json()),
            ]);
            setStats({
                exhibitions: Array.isArray(ex) ? ex.length : 0,
                artists: Array.isArray(art) ? art.length : 0,
                openCalls: Array.isArray(oc) ? oc.filter((c: any) => c.isActive).length : 0,
                subscribers: Array.isArray(sub) ? sub.length : 0,
                messages: Array.isArray(msg) ? msg.filter((m: any) => !m.read).length : 0,
            });
        }
        load();
    }, []);

    return (
        <>
            <div className="admin-header">
                <h1>Dashboard</h1>
                <span style={{ fontSize: "0.75rem", color: "var(--grey-600)" }}>
                    Welcome back, Admin
                </span>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__value">{stats.exhibitions}</div>
                    <div className="stat-card__label">Exhibitions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__value">{stats.artists}</div>
                    <div className="stat-card__label">Artists</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__value">{stats.openCalls}</div>
                    <div className="stat-card__label">Active Open Calls</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__value">{stats.subscribers}</div>
                    <div className="stat-card__label">Subscribers</div>
                </div>
            </div>

            {stats.messages > 0 && (
                <div style={{ background: "var(--accent)", padding: "20px 28px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}>
                        You have {stats.messages} unread message{stats.messages > 1 ? "s" : ""}
                    </span>
                    <Link href="/admin/messages" className="btn btn--dark" style={{ fontSize: "0.7rem" }}>
                        View Messages
                    </Link>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                    { href: "/admin/exhibitions", label: "Manage Exhibitions", desc: "Add, edit, or remove exhibitions" },
                    { href: "/admin/artists", label: "Manage Artists", desc: "Update artist roster and profiles" },
                    { href: "/admin/open-calls", label: "Open Calls & Applications", desc: "Review submissions" },
                    { href: "/admin/newsletter", label: "Send Newsletter", desc: "Compose and send to all subscribers" },
                    { href: "/admin/team", label: "Manage Team", desc: "Update team member profiles" },
                    { href: "/admin/news", label: "Manage News", desc: "Add press and news items" },
                    { href: "/admin/sponsors", label: "Manage Sponsors", desc: "Update logos and partners" },
                    { href: "/admin/pages", label: "Page Content (CMS)", desc: "Edit titles, subtitles, and descriptions" },
                ].map((item) => (
                    <Link href={item.href} key={item.href} style={{ textDecoration: "none" }}>
                        <div className="admin-card" style={{ cursor: "pointer", transition: "border-color 0.3s", borderColor: "rgba(0,0,0,0.06)" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--black)")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.06)")}
                        >
                            <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", marginBottom: 8 }}>{item.label}</div>
                            <p style={{ fontSize: "0.8rem", color: "var(--grey-600)" }}>{item.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}
