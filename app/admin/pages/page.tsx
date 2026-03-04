"use client";
import { useState, useEffect } from "react";

const PAGES = [
    { slug: "home", name: "Home Page" },
    { slug: "artists", name: "Artists Page" },
    { slug: "exhibitions", name: "Exhibitions Page" },
    { slug: "team", name: "Team Page" },
    { slug: "sponsors", name: "Sponsors Page" },
    { slug: "news", name: "News Page" },
    { slug: "contact", name: "Contact Page" },
    { slug: "open-calls", name: "Open Calls Page" },
];

export default function AdminPages() {
    const [pageConfigs, setPageConfigs] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/pages").then(r => r.json()).then(setPageConfigs).catch(() => { });
    }, []);

    const edit = (slug: string) => {
        const existing = pageConfigs.find(p => p.slug === slug);
        setEditing(existing || { slug, title: "", subtitle: "", description: "", sidebarTitle: "", sidebarContent: "", seoTitle: "", seoDescription: "", ogImage: "" });
    };

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const res = await fetch("/api/pages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editing),
        });
        if (res.ok) {
            const updated = await res.json();
            setPageConfigs(prev => {
                const idx = prev.findIndex(p => p.slug === updated.slug);
                if (idx > -1) {
                    const next = [...prev];
                    next[idx] = updated;
                    return next;
                }
                return [...prev, updated];
            });
            setEditing(null);
        }
        setSaving(false);
    }

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div className="admin-header">
                <h1>Page Content CMS</h1>
                <p style={{ color: "var(--grey-500)", fontSize: "0.9rem" }}>Edit titles, descriptions and sidebars for all public pages.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 }}>
                <div className="admin-card" style={{ padding: 0 }}>
                    <div style={{ padding: 24, paddingBottom: 0 }}><h2 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Public Pages</h2></div>
                    {PAGES.map(p => {
                        const isEdited = pageConfigs.some(pc => pc.slug === p.slug);
                        return (
                            <div
                                key={p.slug}
                                onClick={() => edit(p.slug)}
                                style={{
                                    padding: "16px 24px",
                                    borderBottom: "1px solid var(--grey-100)",
                                    cursor: "pointer",
                                    background: editing?.slug === p.slug ? "var(--cream)" : "transparent",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>{p.name}</span>
                                {isEdited && <span style={{ fontSize: "0.6rem", background: "var(--black)", color: "white", padding: "2px 6px", borderRadius: 4 }}>CMS ACTIVE</span>}
                            </div>
                        );
                    })}
                </div>

                <div className="admin-card">
                    {editing ? (
                        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h2 style={{ fontSize: "1.2rem" }}>Editing: {PAGES.find(p => p.slug === editing.slug)?.name}</h2>
                                <button type="button" onClick={() => setEditing(null)} className="btn btn--outline" style={{ fontSize: "0.7rem", padding: "4px 12px" }}>Cancel</button>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Main Title</label>
                                    <input className="form-input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Default: Page Name" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Subtitle / Eyebrow</label>
                                    <input className="form-input" value={editing.subtitle} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} placeholder="Small text above/below title" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Main Description / Content</label>
                                <textarea className="form-textarea" rows={6} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Introductory text..." />
                            </div>

                            <div style={{ padding: 20, background: "var(--cream)", borderRadius: 8, border: "1px solid var(--grey-100)" }}>
                                <h3 style={{ fontSize: "0.9rem", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>Sidebar (Optional)</h3>
                                <div className="form-group">
                                    <label className="form-label">Sidebar Title</label>
                                    <input className="form-input" value={editing.sidebarTitle} style={{ background: "white" }} onChange={e => setEditing({ ...editing, sidebarTitle: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ marginTop: 16 }}>
                                    <label className="form-label">Sidebar Content</label>
                                    <textarea className="form-textarea" rows={4} value={editing.sidebarContent} style={{ background: "white" }} onChange={e => setEditing({ ...editing, sidebarContent: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ padding: 20, background: "var(--white)", borderRadius: 8, border: "1px solid var(--grey-100)" }}>
                                <h3 style={{ fontSize: "0.9rem", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>SEO & Social Media</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">SEO Meta Title</label>
                                        <input className="form-input" value={editing.seoTitle || ""} onChange={e => setEditing({ ...editing, seoTitle: e.target.value })} placeholder="Custom page title for Google" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">SEO Meta Description</label>
                                        <textarea className="form-textarea" rows={2} value={editing.seoDescription || ""} onChange={e => setEditing({ ...editing, seoDescription: e.target.value })} placeholder="Description for search results" />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginTop: 16 }}>
                                    <label className="form-label">OpenGraph Image (FB/X Share Image)</label>
                                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                        <div style={{ width: 120, height: 63, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
                                            {editing.ogImage ? <img src={editing.ogImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#999" }}>1200x630</div>}
                                        </div>
                                        <input type="file" onChange={async (e) => {
                                            const file = e.target.files?.[0]; if (!file) return;
                                            const res = await fetch(`/api/upload/blob?filename=${encodeURIComponent(file.name)}`, { method: "POST", body: file });
                                            const data = await res.json(); if (data.url) setEditing({ ...editing, ogImage: data.url });
                                        }} />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn btn--dark" disabled={saving}>
                                {saving ? "Saving Changes..." : "Save Content"}
                            </button>
                        </form>
                    ) : (
                        <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--grey-400)", textAlign: "center", padding: 40 }}>
                            <p>Select a page from the left to start editing its content.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
