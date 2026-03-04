"use client";
import { useState, useEffect } from "react";

function slugify(s: string) {
    return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const EMPTY = {
    name: "", slug: "", bio: "", content: "", nationality: "", website: "",
    photo: "", membership: "Bronze", order: 0, visibilityEnd: "", gallery: []
};

export default function AdminArtists() {
    const [artists, setArtists] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

    async function load() {
        const data = await fetch(`/api/artists?v=${Date.now()}`, { cache: "no-store" }).then((r) => r.json());
        setArtists(Array.isArray(data) ? data : []);
    }
    useEffect(() => { load(); }, []);

    function openNew() { setForm(EMPTY); setEditing(null); setShowModal(true); }
    function openEdit(a: any) {
        setForm({
            ...EMPTY,
            ...a,
            visibilityEnd: a.visibilityEnd ? a.visibilityEnd.slice(0, 10) : ""
        });
        setEditing(a); setShowModal(true);
    }

    async function save() {
        setSaving(true);
        try {
            const { _id, __v, createdAt, updatedAt, ...cleanForm } = form;
            const payload = { ...cleanForm, slug: form.slug || slugify(form.name) };
            const res = await fetch(editing ? `/api/artists/${editing._id}` : "/api/artists", {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save");
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
        if (!confirm("Delete artist?")) return;
        await fetch(`/api/artists/${id}`, { method: "DELETE" });
        load();
    }

    const ensureExternalLink = (url: string) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `https://${url}`;
    };

    function insertTag(tag: string) {
        const textarea = document.getElementById("artist-content") as HTMLTextAreaElement;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        const selection = text.substring(start, end);

        let newContent = "";
        if (tag === "br") newContent = before + "<br/>" + after;
        else newContent = before + `<${tag}>` + selection + `</${tag}>` + after;

        setForm({ ...form, content: newContent });
    }

    return (
        <>
            <div className="admin-header">
                <h1>Artists</h1>
                <button className="btn btn--dark" onClick={openNew}>+ Add Artist</button>
            </div>
            <div className="admin-card" style={{ padding: 0 }}>
                <table className="admin-table">
                    <thead><tr><th>Name</th><th>Membership</th><th>Nationality</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {artists.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--grey-600)", fontStyle: "italic", padding: 24 }}>No artists yet.</td></tr>
                        )}
                        {artists.map((a) => {
                            const isExpired = a.visibilityEnd && new Date(a.visibilityEnd) < new Date();
                            return (
                                <tr key={a._id} style={{ opacity: isExpired ? 0.5 : 1 }}>
                                    <td style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}>{a.name}</td>
                                    <td>
                                        <span className={`tag tag--${(a.membership || "Bronze").toLowerCase()}`}
                                            style={{ background: a.membership === "Platinum" ? "#fef3c7" : a.membership === "Gold" ? "#fef9c3" : "#f3f4f6", color: "#92400e" }}>
                                            {a.membership || "Bronze"} {a.membership === "Platinum" && `(#${a.order})`}
                                        </span>
                                    </td>
                                    <td>{a.nationality || "—"}</td>
                                    <td>
                                        {isExpired ? <span style={{ color: "#ef4444", fontSize: "0.75rem" }}>Expired</span> : <span style={{ color: "#166534", fontSize: "0.75rem" }}>Visible</span>}
                                        {a.visibilityEnd && <div style={{ fontSize: "0.65rem", color: "var(--grey-400)" }}>till {new Date(a.visibilityEnd).toLocaleDateString()}</div>}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button onClick={() => openEdit(a)} className="btn btn--outline btn--sm">Edit</button>
                                            <button onClick={() => del(a._id)} className="btn btn--outline btn--sm" style={{ color: "#ef4444", borderColor: "#ef4444" }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: 900 }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal__title">{editing ? "Edit Artist" : "Add Artist"}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <div className="form-group">
                                    <label className="form-label">Name *</label>
                                    <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} />
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Membership Type</label>
                                        <select className="form-select" value={form.membership} onChange={(e) => setForm({ ...form, membership: e.target.value })}>
                                            <option value="Platinum">Platinum</option>
                                            <option value="Gold">Gold</option>
                                            <option value="Silver">Silver</option>
                                            <option value="Bronze">Bronze</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ opacity: form.membership === "Platinum" ? 1 : 0.4 }}>
                                        <label className="form-label">Order (Platinum only)</label>
                                        <input className="form-input" type="number" disabled={form.membership !== "Platinum"} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Nationality</label>
                                        <input className="form-input" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Visibility Ends (optional)</label>
                                        <input className="form-input" type="date" value={form.visibilityEnd} onChange={(e) => setForm({ ...form, visibilityEnd: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Website</label>
                                    <input className="form-input" type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Profile Photo</label>
                                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                        {form.photo ? (
                                            <div style={{ position: "relative" }}>
                                                <img src={form.photo} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 2 }} />
                                                <button type="button" onClick={() => setForm({ ...form, photo: "" })} style={{ position: "absolute", top: -8, right: -8, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 10, cursor: "pointer" }}>×</button>
                                            </div>
                                        ) : (
                                            <div style={{ width: 80, height: 80, background: "#eee", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#999" }}>No Photo</div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <input type="file" onChange={async (e) => {
                                                const file = e.target.files?.[0]; if (!file) return;
                                                setUploadingTarget("photo");
                                                try {
                                                    const res = await fetch(`/api/upload/blob?filename=${encodeURIComponent(file.name)}`, { method: "POST", body: file });
                                                    const data = await res.json();
                                                    if (data.url) setForm({ ...form, photo: data.url });
                                                } catch { alert("Upload failed"); } finally { setUploadingTarget(null); }
                                            }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Work Gallery (Multi-upload)</label>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8, marginBottom: 12 }}>
                                        {(form.gallery || []).map((img: string, i: number) => (
                                            <div key={i} style={{ position: "relative", height: 80, background: "#eee" }}>
                                                <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                <button type="button" onClick={() => setForm({ ...form, gallery: form.gallery.filter((_: any, j: number) => j !== i) })}
                                                    style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 16, height: 16, fontSize: 8, cursor: "pointer" }}>×</button>
                                            </div>
                                        ))}
                                        <label style={{ height: 80, border: "1px dashed var(--grey-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", cursor: "pointer", color: "var(--grey-400)" }}>
                                            +
                                            <input type="file" multiple style={{ display: "none" }} onChange={async (e) => {
                                                const files = Array.from(e.target.files || []); if (!files.length) return;
                                                setUploadingTarget("gallery");
                                                try {
                                                    const urls = [];
                                                    for (const file of files) {
                                                        const res = await fetch(`/api/upload/blob?filename=${encodeURIComponent(file.name)}`, { method: "POST", body: file });
                                                        const data = await res.json();
                                                        if (data.url) urls.push(data.url);
                                                    }
                                                    setForm({ ...form, gallery: [...(form.gallery || []), ...urls] });
                                                } catch { alert("Upload failed"); } finally { setUploadingTarget(null); }
                                            }} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <div className="form-group">
                                    <label className="form-label">Short Bio (for listing)</label>
                                    <textarea className="form-textarea" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                        <label className="form-label">Detailed Content (HTML styles)</label>
                                        <div style={{ display: "flex", gap: 4 }}>
                                            {["h3", "b", "i", "br"].map(tag => (
                                                <button key={tag} type="button" onClick={() => insertTag(tag)} className="btn btn--outline"
                                                    style={{ padding: "2px 8px", fontSize: "0.6rem", textTransform: "uppercase" }}>{tag}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea
                                        id="artist-content"
                                        className="form-textarea" style={{ minHeight: 400, fontFamily: "monospace", fontSize: "0.85rem" }}
                                        value={form.content}
                                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                                        placeholder="Use HTML or the buttons above to format the detailed page..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 32 }}>
                            <button onClick={() => setShowModal(false)} className="btn btn--outline">Cancel</button>
                            <button onClick={save} disabled={saving || !!uploadingTarget} className="btn btn--dark">
                                {saving ? "Saving..." : uploadingTarget ? "Uploading..." : editing ? "Update Artist" : "Add Artist"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
