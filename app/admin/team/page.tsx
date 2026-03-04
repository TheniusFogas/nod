"use client";
import { useState, useEffect } from "react";

const EMPTY = { name: "", role: "", bio: "", photo: "", email: "", website: "", order: 0 };

export default function AdminTeam() {
    const [team, setTeam] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [saving, setSaving] = useState(false);

    async function load() {
        const data = await fetch("/api/team", { cache: "no-store" }).then((r) => r.json());
        setTeam(Array.isArray(data) ? data : []);
    }
    useEffect(() => { load(); }, []);

    function openNew() { setForm(EMPTY); setEditing(null); setShowModal(true); }
    function openEdit(m: any) {
        setForm({
            name: m.name || "", role: m.role || "", bio: m.bio || "",
            photo: m.photo || "", email: m.email || "", website: m.website || "",
            order: m.order || 0
        });
        setEditing(m); setShowModal(true);
    }

    async function save() {
        setSaving(true);
        try {
            const { _id, ...payload } = form;
            const res = await fetch(editing ? `/api/team/${editing._id}` : "/api/team", {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save team member");
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
        if (!confirm("Remove team member?")) return;
        await fetch(`/api/team/${id}`, { method: "DELETE" });
        load();
    }

    const ensureExternalLink = (url: string) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `https://${url}`;
    };

    return (
        <>
            <div className="admin-header">
                <h1>Team</h1>
                <button className="btn btn--dark" onClick={openNew}>+ Add Member</button>
            </div>
            <div className="admin-card" style={{ padding: 0 }}>
                <table className="admin-table">
                    <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Website</th><th>Order</th><th>Actions</th></tr></thead>
                    <tbody>
                        {team.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--grey-600)", fontStyle: "italic" }}>No team members yet.</td></tr>
                        )}
                        {team.map((m) => (
                            <tr key={m._id}>
                                <td style={{ fontFamily: "var(--font-serif)" }}>{m.name}</td>
                                <td style={{ fontSize: "0.85rem", color: "var(--grey-400)" }}>{m.role}</td>
                                <td style={{ fontSize: "0.8rem" }}>{m.email || "—"}</td>
                                <td style={{ fontSize: "0.8rem" }}>
                                    {m.website ? (
                                        <a href={ensureExternalLink(m.website)} target="_blank" rel="noopener" style={{ color: "var(--accent-dark)" }}>↗ Site</a>
                                    ) : "—"}
                                </td>
                                <td>{m.order}</td>
                                <td>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => openEdit(m)} className="btn btn--outline" style={{ padding: "6px 14px", fontSize: "0.7rem" }}>Edit</button>
                                        <button onClick={() => del(m._id)} style={{ padding: "6px 14px", fontSize: "0.7rem", border: "1px solid #e74c3c", color: "#e74c3c", cursor: "pointer", background: "transparent" }}>Delete</button>
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
                        <div className="modal__title">{editing ? "Edit Member" : "Add Team Member"}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Name *</label>
                                    <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role *</label>
                                    <input className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Website</label>
                                    <input className="form-input" placeholder="www.site.com" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Display Order</label>
                                <input className="form-input" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Photo</label>
                                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                    {form.photo && <img src={form.photo} style={{ width: 60, height: 80, objectFit: "cover", borderRadius: 2 }} />}
                                    <div style={{ flex: 1 }}>
                                        <input type="file" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setSaving(true);
                                            try {
                                                const res = await fetch(`/api/upload/blob?filename=${encodeURIComponent(file.name)}`, { method: "POST", body: file });
                                                const data = await res.json();
                                                if (data.url) setForm({ ...form, photo: data.url });
                                            } catch (err) { alert("Upload failed"); }
                                            finally { setSaving(false); }
                                        }} />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bio</label>
                                <textarea className="form-textarea" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
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
