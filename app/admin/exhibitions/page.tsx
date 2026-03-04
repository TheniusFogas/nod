"use client";
import { useState, useEffect } from "react";

const EMPTY = {
    title: "", artist: "", slug: "", type: "current",
    startDate: "", endDate: "", location: "NOD FLOW Gallery",
    coverImage: "", description: "", pressRelease: "",
};

function slugify(str: string) {
    return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminExhibitions() {
    const [exhibitions, setExhibitions] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    async function load() {
        const data = await fetch("/api/exhibitions").then((r) => r.json());
        setExhibitions(Array.isArray(data) ? data : []);
    }
    useEffect(() => { load(); }, []);

    function openNew() { setForm(EMPTY); setEditing(null); setShowModal(true); }
    function openEdit(ex: any) {
        setForm({
            title: ex.title || "", artist: ex.artist || "", slug: ex.slug || "",
            type: ex.type || "current", startDate: ex.startDate?.slice(0, 10) || "",
            endDate: ex.endDate?.slice(0, 10) || "", location: ex.location || "NOD FLOW Gallery",
            coverImage: ex.coverImage || "", description: ex.description || "", pressRelease: ex.pressRelease || "",
        });
        setEditing(ex);
        setShowModal(true);
    }

    async function save() {
        setSaving(true);
        try {
            const { _id, ...cleanForm } = form as any;
            const payload = { ...cleanForm, slug: form.slug || slugify(form.title) };
            const res = await fetch(editing ? `/api/exhibitions/${editing._id}` : "/api/exhibitions", {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save exhibition");
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
        if (!confirm("Delete this exhibition?")) return;
        await fetch(`/api/exhibitions/${id}`, { method: "DELETE" });
        load();
    }

    return (
        <>
            <div className="admin-header">
                <h1>Exhibitions</h1>
                <button className="btn btn--dark" onClick={openNew} id="add-exhibition-btn">+ Add Exhibition</button>
            </div>

            <div className="admin-card" style={{ padding: 0 }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th><th>Artist</th><th>Type</th>
                            <th>Dates</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exhibitions.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--grey-600)", fontStyle: "italic" }}>No exhibitions yet.</td></tr>
                        )}
                        {exhibitions.map((ex) => (
                            <tr key={ex._id}>
                                <td style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}>{ex.title}</td>
                                <td>{ex.artist}</td>
                                <td><span className={`tag tag--${ex.type}`}>{ex.type}</span></td>
                                <td style={{ fontSize: "0.8rem", color: "var(--grey-600)" }}>
                                    {ex.startDate ? new Date(ex.startDate).toLocaleDateString("en-GB") : "—"} —{" "}
                                    {ex.endDate ? new Date(ex.endDate).toLocaleDateString("en-GB") : "—"}
                                </td>
                                <td>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => openEdit(ex)} className="btn btn--outline" style={{ padding: "6px 14px", fontSize: "0.7rem" }}>Edit</button>
                                        <button onClick={() => del(ex._id)} style={{ padding: "6px 14px", fontSize: "0.7rem", border: "1px solid #e74c3c", color: "#e74c3c", cursor: "pointer", background: "transparent" }}>Delete</button>
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
                        <div className="modal__title">{editing ? "Edit Exhibition" : "New Exhibition"}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Title *</label>
                                    <input className="form-input" value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Artist *</label>
                                    <input className="form-input" value={form.artist}
                                        onChange={(e) => setForm({ ...form, artist: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Slug</label>
                                    <input className="form-input" value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select className="form-select" value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                        <option value="current">Current</option>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="past">Past</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input className="form-input" type="date" value={form.startDate}
                                        onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input className="form-input" type="date" value={form.endDate}
                                        onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cover Image</label>
                                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                    {form.coverImage && <img src={form.coverImage} style={{ width: 100, height: 60, objectFit: "cover", borderRadius: 2 }} />}
                                    <div style={{ flex: 1 }}>
                                        <input type="file" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setSaving(true);
                                            try {
                                                const res = await fetch(`/api/upload/blob?filename=${encodeURIComponent(file.name)}`, { method: "POST", body: file });
                                                const data = await res.json();
                                                if (data.url) setForm({ ...form, coverImage: data.url });
                                            } catch (err) { alert("Upload failed"); }
                                            finally { setSaving(false); }
                                        }} />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input className="form-input" value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" rows={4} value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Press Release</label>
                                <textarea className="form-textarea" rows={4} value={form.pressRelease}
                                    onChange={(e) => setForm({ ...form, pressRelease: e.target.value })} />
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                                <button onClick={() => setShowModal(false)} className="btn btn--outline">Cancel</button>
                                <button onClick={save} disabled={saving} className="btn btn--dark">
                                    {saving ? "Saving..." : editing ? "Update" : "Create"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
