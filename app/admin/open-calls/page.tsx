"use client";
import { useState, useEffect } from "react";

const EMPTY = { title: "", slug: "", description: "", requirements: "", deadline: "", isActive: true, showOnHomepage: false, coverImage: "", seoTitle: "", seoDescription: "", ogImage: "" };

function slugify(str: string) {
    return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminOpenCalls() {
    const [calls, setCalls] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [selectedCall, setSelectedCall] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    async function load() {
        const data = await fetch(`/api/open-calls?v=${Date.now()}`, { cache: "no-store" }).then((r) => r.json());
        setCalls(Array.isArray(data) ? data : []);
    }

    async function loadApplications(call: any) {
        setSelectedCall(call);
        const data = await fetch(`/api/open-calls/${call._id}/apply`).then((r) => r.json());
        setApplications(Array.isArray(data) ? data : []);
    }

    useEffect(() => { load(); }, []);

    async function deleteAssets(appId: string) {
        if (!confirm("Delete all images for this application to save space? Text data will be preserved.")) return;
        const res = await fetch(`/api/open-calls/applications/${appId}/delete-assets`, { method: "POST" });
        if (res.ok) {
            alert("Assets deleted.");
            loadApplications(selectedCall);
        }
    }

    function openNew() { setForm(EMPTY); setEditing(null); setShowModal(true); }
    function openEdit(c: any) {
        setForm({
            title: c.title || "", slug: c.slug || "", description: c.description || "",
            requirements: c.requirements || "", deadline: c.deadline?.slice(0, 10) || "",
            isActive: c.isActive ?? true, showOnHomepage: c.showOnHomepage ?? false, coverImage: c.coverImage || "",
            seoTitle: c.seoTitle || "", seoDescription: c.seoDescription || "", ogImage: c.ogImage || ""
        });
        setEditing(c); setShowModal(true);
    }

    async function save() {
        setSaving(true);
        try {
            const { _id, ...cleanForm } = form as any;
            const payload = { ...cleanForm, slug: form.slug || slugify(form.title) };
            const res = await fetch(editing ? `/api/open-calls/${editing._id}` : "/api/open-calls", {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save open call");
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
        if (!confirm("Delete this open call?")) return;
        await fetch(`/api/open-calls/${id}`, { method: "DELETE" });
        load();
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">Open Calls</h1>
                <button className="btn btn--dark" onClick={openNew}>+ New Open Call</button>
            </div>

            <div className="card" style={{ padding: 0, marginBottom: 48 }}>
                <table className="admin-table">
                    <thead><tr><th>Title</th><th>Deadline</th><th>Status</th><th>Homepage</th><th>Actions</th></tr></thead>
                    <tbody>
                        {calls.length === 0 && (
                            <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: "var(--grey-600)" }}>No open calls yet.</td></tr>
                        )}
                        {calls.map((c) => (
                            <tr key={c._id}>
                                <td style={{ fontWeight: 500 }}>{c.title}</td>
                                <td style={{ fontSize: "0.8rem" }}>{c.deadline ? new Date(c.deadline).toLocaleDateString("en-GB") : "—"}</td>
                                <td><span className={`tag ${c.isActive ? "tag--active" : "tag--inactive"}`}>{c.isActive ? "Active" : "Closed"}</span></td>
                                <td><span style={{ fontSize: "0.75rem", color: c.showOnHomepage ? "#166534" : "#999" }}>{c.showOnHomepage ? "✓ Da" : "Nu"}</span></td>
                                <td>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => loadApplications(c)} className="btn btn--outline btn--sm">Submissions</button>
                                        <button onClick={() => openEdit(c)} className="btn btn--outline btn--sm">Edit</button>
                                        <button onClick={() => del(c._id)} className="btn btn--outline btn--sm" style={{ borderColor: "#ef4444", color: "#ef4444" }}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedCall && (
                <div className="fade-in">
                    <div className="admin-header" style={{ marginBottom: 24 }}>
                        <h2 className="admin-title" style={{ fontSize: "1.25rem" }}>
                            Submissions: {selectedCall.title}
                        </h2>
                        <button onClick={() => { setSelectedCall(null); setApplications([]); }} className="btn btn--outline btn--sm">✕ Close</button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {applications.length === 0 && (
                            <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--grey-400)" }}>No submissions found for this call.</div>
                        )}
                        {applications.map((a) => (
                            <div key={a._id} className="card">
                                <div className="card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <h3 style={{ fontSize: "1.1rem", marginBottom: 4 }}>{a.artistName}</h3>
                                        <div style={{ display: "flex", gap: 16, fontSize: "0.8rem", color: "var(--grey-600)" }}>
                                            <a href={`mailto:${a.email}`} style={{ color: "inherit" }}>{a.email}</a>
                                            {a.phone && <span>{a.phone}</span>}
                                            {a.website && <a href={a.website} target="_blank" style={{ color: "var(--accent-dark)" }}>Website</a>}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "0.75rem", color: "var(--grey-400)", marginBottom: 8 }}>Submitted {new Date(a.createdAt).toLocaleDateString("en-GB")}</div>
                                        {a.images && a.images.length > 0 && (
                                            <button onClick={() => deleteAssets(a._id)} style={{ fontSize: "0.65rem", color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}>
                                                ERASE IMAGES (SAVE SPACE)
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="card__body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                                    <div>
                                        <h4 style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, color: "var(--grey-400)" }}>Artist Statement</h4>
                                        <p style={{ fontSize: "0.9rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{a.statement}</p>

                                        {a.videoLink && (
                                            <div style={{ marginTop: 24 }}>
                                                <h4 style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, color: "var(--grey-400)" }}>Video Work</h4>
                                                <a href={a.videoLink} target="_blank" className="btn btn--outline btn--sm" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                                    ▶ View Video Submission
                                                </a>
                                            </div>
                                        )}

                                        <div style={{ marginTop: 24, fontSize: "0.8rem", color: a.agreeToContact ? "#166534" : "var(--grey-400)" }}>
                                            {a.agreeToContact ? "✓ Opted-in for future contact" : "× Not opted-in for future contact"}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, color: "var(--grey-400)" }}>Work Samples</h4>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 12 }}>
                                            {a.images && a.images.length > 0 ? a.images.map((img: any, i: number) => (
                                                <a key={i} href={img.url} target="_blank" style={{ display: "block", borderRadius: 2, overflow: "hidden", border: "1px solid var(--grey-100)" }}>
                                                    <img src={img.url} style={{ width: "100%", height: 80, objectFit: "cover" }} />
                                                </a>
                                            )) : (
                                                <div style={{ fontSize: "0.8rem", color: "var(--grey-600)", fontStyle: "italic" }}>
                                                    Images have been deleted or were not provided.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__title">{editing ? "Edit Open Call" : "New Open Call"}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input className="form-input" value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Deadline</label>
                                    <input className="form-input" type="date" value={form.deadline}
                                        onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" value={form.isActive ? "active" : "closed"}
                                        onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}>
                                        <option value="active">Active</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Arată pe Homepage?</label>
                                    <select className="form-select" value={form.showOnHomepage ? "yes" : "no"}
                                        onChange={(e) => setForm({ ...form, showOnHomepage: e.target.value === "yes" })}>
                                        <option value="no">Nu</option>
                                        <option value="yes">Da</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" rows={4} value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cover Image</label>
                                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                    {form.coverImage ? (
                                        <div style={{ position: "relative" }}>
                                            <img src={form.coverImage} style={{ width: 100, height: 60, objectFit: "cover", borderRadius: 2 }} />
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, coverImage: "" })}
                                                style={{ position: "absolute", top: -8, right: -8, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer" }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ width: 100, height: 60, background: "#eee", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#999" }}>No Cover</div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <input type="file" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setSaving(true);
                                            try {
                                                const __fd = new FormData(); __fd.append("file", file); __fd.append("folder", "nodflo/content"); const res = await fetch("/api/upload", { method: "POST", body: __fd });
                                                const data = await res.json();
                                                if (data.url) setForm({ ...form, coverImage: data.url });
                                            } catch (err) { alert("Upload failed"); }
                                            finally { setSaving(false); }
                                        }} />
                                        <input
                                            className="form-input"
                                            style={{ marginTop: 8, fontSize: "0.8rem" }}
                                            placeholder="Or paste image URL..."
                                            value={form.coverImage}
                                            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Requirements</label>
                                <textarea className="form-textarea" rows={4} value={form.requirements}
                                    onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
                            </div>

                            <div style={{ padding: 20, background: "var(--cream)", borderRadius: 8, border: "1px solid var(--grey-100)" }}>
                                <h3 style={{ fontSize: "0.9rem", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>SEO & Social Media</h3>
                                <div className="form-group">
                                    <label className="form-label">SEO Meta Title</label>
                                    <input className="form-input" value={form.seoTitle} style={{ background: "white" }} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ marginTop: 12 }}>
                                    <label className="form-label">SEO Meta Description</label>
                                    <textarea className="form-textarea" rows={2} style={{ background: "white" }} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ marginTop: 12 }}>
                                    <label className="form-label">OG Image (1200x630)</label>
                                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                        <div style={{ width: 80, height: 50, background: "#ddd", borderRadius: 4, overflow: "hidden" }}>
                                            {form.ogImage ? <img src={form.ogImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                                        </div>
                                        <input type="file" onChange={async (e) => {
                                            const file = e.target.files?.[0]; if (!file) return;
                                            const __fd = new FormData(); __fd.append("file", file); __fd.append("folder", "nodflo/content"); const res = await fetch("/api/upload", { method: "POST", body: __fd });
                                            const data = await res.json(); if (data.url) setForm({ ...form, ogImage: data.url });
                                        }} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                                <button onClick={() => setShowModal(false)} className="btn btn--outline">Cancel</button>
                                <button onClick={save} disabled={saving} className="btn btn--dark">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
