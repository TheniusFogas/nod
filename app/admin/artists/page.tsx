"use client";
import { useState, useEffect } from "react";

function slugify(s: string) {
    return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const EMPTY = { name: "", slug: "", bio: "", nationality: "", website: "", photo: "" };

export default function AdminArtists() {
    const [artists, setArtists] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [saving, setSaving] = useState(false);

    async function load() {
        const data = await fetch("/api/artists").then((r) => r.json());
        setArtists(Array.isArray(data) ? data : []);
    }
    useEffect(() => { load(); }, []);

    function openNew() { setForm(EMPTY); setEditing(null); setShowModal(true); }
    function openEdit(a: any) {
        setForm({ name: a.name || "", slug: a.slug || "", bio: a.bio || "", nationality: a.nationality || "", website: a.website || "", photo: a.photo || "" });
        setEditing(a); setShowModal(true);
    }

    async function save() {
        setSaving(true);
        const payload = { ...form, slug: form.slug || slugify(form.name) };
        if (editing) await fetch(`/api/artists/${editing._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        else await fetch("/api/artists", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        setSaving(false); setShowModal(false); load();
    }

    async function del(id: string) {
        if (!confirm("Delete artist?")) return;
        await fetch(`/api/artists/${id}`, { method: "DELETE" });
        load();
    }

    const ensureExternalLink = (url: string) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `https://${url}`;
    };

    return (
        <>
            <div className="admin-header">
                <h1>Artists</h1>
                <button className="btn btn--dark" onClick={openNew}>+ Add Artist</button>
            </div>
            <div className="admin-card" style={{ padding: 0 }}>
                <table className="admin-table">
                    <thead><tr><th>Name</th><th>Nationality</th><th>Website</th><th>Actions</th></tr></thead>
                    <tbody>
                        {artists.length === 0 && (
                            <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--grey-600)", fontStyle: "italic" }}>No artists yet.</td></tr>
                        )}
                        {artists.map((a) => (
                            <tr key={a._id}>
                                <td style={{ fontFamily: "var(--font-serif)" }}>{a.name}</td>
                                <td>{a.nationality || "—"}</td>
                                <td>{a.website ? <a href={ensureExternalLink(a.website)} target="_blank" rel="noopener" style={{ color: "var(--accent-dark)", fontSize: "0.8rem" }}>↗ Site</a> : "—"}</td>
                                <td>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => openEdit(a)} className="btn btn--outline" style={{ padding: "6px 14px", fontSize: "0.7rem" }}>Edit</button>
                                        <button onClick={() => del(a._id)} style={{ padding: "6px 14px", fontSize: "0.7rem", border: "1px solid #e74c3c", color: "#e74c3c", cursor: "pointer", background: "transparent" }}>Delete</button>
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
                        <div className="modal__title">{editing ? "Edit Artist" : "Add Artist"}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Name *</label>
                                    <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nationality</label>
                                    <input className="form-input" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Website</label>
                                <input className="form-input" type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Photo URL</label>
                                <input className="form-input" placeholder="https://..." value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bio</label>
                                <textarea className="form-textarea" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                                <button onClick={() => setShowModal(false)} className="btn btn--outline">Cancel</button>
                                <button onClick={save} disabled={saving} className="btn btn--dark">{saving ? "Saving..." : editing ? "Update" : "Add"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
