"use client";
import { useState, useEffect } from "react";

const EMPTY = { name: "", logo: "", website: "", tier: "partner", order: 0 };

export default function AdminSponsors() {
    const [sponsors, setSponsors] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [saving, setSaving] = useState(false);

    async function load() {
        const data = await fetch(`/api/sponsors?v=${Date.now()}`, { cache: "no-store" }).then((r) => r.json());
        setSponsors(Array.isArray(data) ? data : []);
    }
    useEffect(() => { load(); }, []);

    function openNew() { setForm(EMPTY); setEditing(null); setShowModal(true); }
    function openEdit(s: any) {
        setForm({ name: s.name || "", logo: s.logo || "", website: s.website || "", tier: s.tier || "partner", order: s.order || 0 });
        setEditing(s); setShowModal(true);
    }

    async function save() {
        setSaving(true);
        try {
            const { _id, __v, ...payload } = form;
            const res = await fetch(editing ? `/api/sponsors/${editing._id}` : "/api/sponsors", {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save sponsor");
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
        if (!confirm("Remove sponsor?")) return;
        await fetch(`/api/sponsors/${id}`, { method: "DELETE" });
        load();
    }

    return (
        <>
            <div className="admin-header">
                <h1>Sponsors</h1>
                <button className="btn btn--dark" onClick={openNew}>+ Add Sponsor</button>
            </div>
            <div className="admin-card" style={{ padding: 0 }}>
                <table className="admin-table">
                    <thead><tr><th>Name</th><th>Tier</th><th>Website</th><th>Actions</th></tr></thead>
                    <tbody>
                        {sponsors.length === 0 && (
                            <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--grey-600)", fontStyle: "italic" }}>No sponsors yet.</td></tr>
                        )}
                        {sponsors.map((s) => (
                            <tr key={s._id}>
                                <td style={{ fontFamily: "var(--font-serif)" }}>{s.name}</td>
                                <td><span className="tag tag--upcoming" style={{ textTransform: "capitalize" }}>{s.tier}</span></td>
                                <td>{s.website ? <a href={s.website} target="_blank" style={{ color: "var(--accent-dark)", fontSize: "0.8rem" }}>↗ Site</a> : "—"}</td>
                                <td>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => openEdit(s)} className="btn btn--outline" style={{ padding: "6px 14px", fontSize: "0.7rem" }}>Edit</button>
                                        <button onClick={() => del(s._id)} style={{ padding: "6px 14px", fontSize: "0.7rem", border: "1px solid #e74c3c", color: "#e74c3c", cursor: "pointer", background: "transparent" }}>Delete</button>
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
                        <div className="modal__title">{editing ? "Edit Sponsor" : "Add Sponsor"}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Name *</label>
                                    <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tier</label>
                                    <select className="form-select" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}>
                                        <option value="gold">Gold</option>
                                        <option value="silver">Silver</option>
                                        <option value="partner">Partner</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Logo</label>
                                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                    {form.logo ? (
                                        <div style={{ position: "relative" }}>
                                            <img src={form.logo} style={{ height: 40, objectFit: "contain", borderRadius: 2 }} />
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, logo: "" })}
                                                style={{ position: "absolute", top: -8, right: -8, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer" }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ width: 60, height: 40, background: "#eee", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#999" }}>No Logo</div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <input type="file" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setSaving(true);
                                            try {
                                                const __fd = new FormData(); __fd.append("file", file); __fd.append("folder", "nodflo/content"); const res = await fetch("/api/upload", { method: "POST", body: __fd });
                                                const data = await res.json();
                                                if (data.url) setForm({ ...form, logo: data.url });
                                            } catch (err) { alert("Upload failed"); }
                                            finally { setSaving(false); }
                                        }} />
                                        <input
                                            className="form-input"
                                            style={{ marginTop: 8, fontSize: "0.8rem" }}
                                            placeholder="Or paste logo URL..."
                                            value={form.logo}
                                            onChange={(e) => setForm({ ...form, logo: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Website</label>
                                <input className="form-input" type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
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
