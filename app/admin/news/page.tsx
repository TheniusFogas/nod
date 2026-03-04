"use client";
import { useState, useEffect } from "react";

const EMPTY = { title: "", date: "", excerpt: "", content: "", link: "", image: "", source: "" };

export default function AdminNews() {
    const [news, setNews] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

    async function load() {
        const data = await fetch("/api/news").then((r) => r.json());
        setNews(Array.isArray(data) ? data : []);
    }
    useEffect(() => { load(); }, []);

    function openNew() { setForm(EMPTY); setEditing(null); setShowModal(true); }
    function openEdit(n: any) {
        setForm({
            title: n.title || "",
            date: n.date?.slice(0, 10) || "",
            excerpt: n.excerpt || "",
            content: n.content || "",
            link: n.link || "",
            image: n.image || "",
            source: n.source || ""
        });
        setEditing(n); setShowModal(true);
    }

    async function save() {
        if (!form.title || !form.date) return alert("Title and Date are required.");
        setSaving(true);
        try {
            const { _id, __v, ...data } = form;
            const res = await fetch(editing ? `/api/news/${editing._id}` : "/api/news", {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save news");
            }
            setShowModal(false);
            load();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setSaving(false);
        }
    }

    async function del(id: string) {
        if (!confirm("Delete news item?")) return;
        await fetch(`/api/news/${id}`, { method: "DELETE" });
        load();
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>News & Press</h1>
                <button className="btn btn--dark" onClick={openNew}>+ Add News</button>
            </div>

            <div className="admin-card" style={{ padding: 0 }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Source</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {news.length === 0 && (
                            <tr><td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--grey-400)" }}>No news articles found.</td></tr>
                        )}
                        {news.map((n) => (
                            <tr key={n._id}>
                                <td style={{ fontFamily: "var(--font-serif)" }}>{n.title}</td>
                                <td style={{ fontSize: "0.8rem" }}>{n.source || "—"}</td>
                                <td style={{ fontSize: "0.8rem", color: "var(--grey-600)" }}>
                                    {n.date ? new Date(n.date).toLocaleDateString("en-GB") : "—"}
                                </td>
                                <td>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => openEdit(n)} className="btn btn--outline" style={{ padding: "6px 14px", fontSize: "0.7rem" }}>Edit</button>
                                        <button onClick={() => del(n._id)} style={{ padding: "6px 14px", fontSize: "0.7rem", border: "1px solid #e74c3c", color: "#e74c3c", cursor: "pointer", background: "transparent" }}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__title">{editing ? "Edit News" : "Add News"}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input className="form-input" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Date *</label>
                                    <input className="form-input" type="date" value={form.date} onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Source</label>
                                    <input className="form-input" placeholder="e.g. Artforum, Le Monde..." value={form.source} onChange={(e) => setForm(prev => ({ ...prev, source: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Link (Optional)</label>
                                <input className="form-input" type="url" value={form.link} onChange={(e) => setForm(prev => ({ ...prev, link: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cover Image</label>
                                <div style={{ position: "relative", marginBottom: "8px", minHeight: "120px", background: "var(--white-200)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--grey-100)" }}>
                                    {form.image ? (
                                        <img src={form.image} style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{ fontSize: "0.75rem", color: "var(--grey-400)" }}>No cover image</span>
                                    )}
                                    {uploadingTarget === "news-cover" && (
                                        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 600 }}>
                                            UPLOADING...
                                        </div>
                                    )}
                                </div>
                                <input type="file" disabled={!!uploadingTarget} onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setUploadingTarget("news-cover");
                                        const fd = new FormData();
                                        fd.append("file", file);
                                        fd.append("folder", "news");
                                        try {
                                            const res = await fetch(`/api/upload/blob?filename=${encodeURIComponent(file.name)}`, {
                                                method: "POST",
                                                body: file
                                            });
                                            if (!res.ok) throw new Error("Upload failed");
                                            const data = await res.json();
                                            if (data.url) {
                                                setForm(prev => ({ ...prev, image: data.url }));
                                            }
                                        } catch (err) {
                                            alert("Failed to upload image.");
                                        } finally {
                                            setUploadingTarget(null);
                                        }
                                    }
                                }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Full Article Content (HTML allowed)</label>
                                <textarea
                                    className="form-input"
                                    rows={10}
                                    value={form.content}
                                    placeholder="Write the full article content here..."
                                    onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                                />
                            </div>
                            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                                <button className="btn btn--dark" style={{ flex: 1 }} onClick={save} disabled={saving || !!uploadingTarget}>
                                    {saving ? "Saving..." : "Save News Item"}
                                </button>
                                <button className="btn btn--outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
