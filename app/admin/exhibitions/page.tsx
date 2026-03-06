"use client";
import { useState, useEffect } from "react";
import { getExhibitionStatus } from "@/lib/exhibitions";

const EMPTY = {
    title: "",
    slug: "",
    exhibitionType: "Solo",
    artists: [] as { artist?: string; manualName?: string }[],
    type: "current", // Deprecated but kept to satisfy legacy schema bounds
    startDate: "",
    endDate: "",
    openingTime: "",
    location: {
        name: "NOD FLOW Gallery",
        address: "",
        mapUrl: ""
    },
    coverImage: "",
    description: "",
    pressRelease: "",
    images: [] as string[],
    featured: false,
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
};

function slugify(str: string) {
    return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const timeOptions: string[] = [];
for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
        timeOptions.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
}

function ArtistSelect({ allArtists, value, onChange }: { allArtists: any[], value: string, onChange: (v: string) => void }) {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (value) {
            setSearch(allArtists.find(a => a._id === value)?.name || "");
        } else {
            setSearch("");
        }
    }, [value, allArtists]);

    const filtered = allArtists.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ position: "relative" }}>
            <input
                className="form-input"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOpen(true); onChange(""); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                placeholder="Search artist..."
                style={{ width: "100%", background: "white" }}
            />
            {open && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #ccc", maxHeight: 200, overflowY: "auto", zIndex: 10 }}>
                    <div style={{ padding: 8, cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "0.8rem", color: "var(--grey-600)" }} onMouseDown={() => { onChange(""); setSearch(""); setOpen(false); }}>-- No Selection --</div>
                    {filtered.map(a => (
                        <div key={a._id} style={{ padding: 8, cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "0.9rem" }} onMouseDown={() => { onChange(a._id); setSearch(a.name); setOpen(false); }}>
                            {a.name}
                        </div>
                    ))}
                    {filtered.length === 0 && <div style={{ padding: 8, color: "#999", fontSize: "0.8rem" }}>No artists found</div>}
                </div>
            )}
        </div>
    );
}

export default function AdminExhibitions() {
    const [exhibitions, setExhibitions] = useState<any[]>([]);
    const [allArtists, setAllArtists] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    async function load() {
        const data = await fetch(`/api/exhibitions?v=${Date.now()}`, { cache: "no-store" }).then((r) => r.json());
        setExhibitions(Array.isArray(data) ? data : []);

        const artistsData = await fetch("/api/artists").then(r => r.json());
        setAllArtists(Array.isArray(artistsData) ? artistsData : []);
    }
    useEffect(() => { load(); }, []);

    function openNew() { setForm(EMPTY); setEditing(null); setShowModal(true); }
    function openEdit(ex: any) {
        setForm({
            title: ex.title || "",
            slug: ex.slug || "",
            exhibitionType: ex.exhibitionType || "Solo",
            artists: Array.isArray(ex.artists) ? ex.artists.map((a: any) => ({
                artist: a.artist?._id || a.artist || undefined,
                manualName: a.manualName || ""
            })) : [],
            type: ex.type || "current",
            startDate: ex.startDate?.slice(0, 10) || "",
            endDate: ex.endDate?.slice(0, 10) || "",
            openingTime: ex.openingTime || "",
            location: {
                name: ex.location?.name || (typeof ex.location === 'string' ? ex.location : "NOD FLOW Gallery"),
                address: ex.location?.address || "",
                mapUrl: ex.location?.mapUrl || ""
            },
            coverImage: ex.coverImage || "",
            description: ex.description || "",
            pressRelease: ex.pressRelease || "",
            images: Array.isArray(ex.images) ? ex.images : [],
            featured: ex.featured || false,
            seoTitle: ex.seoTitle || "",
            seoDescription: ex.seoDescription || "",
            ogImage: ex.ogImage || "",
        });
        setEditing(ex);
        setShowModal(true);
    }

    async function save() {
        if (!form.title) return alert("Title is required");
        setSaving(true);
        try {
            const payload = {
                ...form,
                slug: form.slug || slugify(form.title),
                // Compatibility for old "artist" field used in listing tables
                artist: form.exhibitionType === "Solo"
                    ? (form.artists[0]?.manualName || allArtists.find(a => a._id === form.artists[0]?.artist)?.name || "N/A")
                    : "Group Exhibition"
            };
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

    const addArtistEntry = () => {
        setForm({ ...form, artists: [...form.artists, { manualName: "" }] });
    };

    const removeArtistEntry = (index: number) => {
        setForm({ ...form, artists: form.artists.filter((_, i) => i !== index) });
    };

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
                            <th>Title</th><th>Type / Artist</th><th>Status</th>
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
                                <td>
                                    <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--grey-500)" }}>
                                        {ex.exhibitionType || "Solo"}
                                    </div>
                                    <div style={{ fontWeight: 500 }}>{ex.artist}</div>
                                </td>
                                <td>
                                    {(() => {
                                        const status = getExhibitionStatus(ex.startDate, ex.endDate);
                                        return <span className={`tag tag--${status}`}>{status}</span>;
                                    })()}
                                </td>
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
                    <div className="modal modal--large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1000, width: "95vw" }}>
                        <div className="modal__title">{editing ? "Edit Exhibition" : "New Exhibition"}</div>
                        <div className="form-grid-2col">
                            {/* Left Column */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                <div className="form-group">
                                    <label className="form-label">Exhibition Title *</label>
                                    <input className="form-input" value={form.title} placeholder="e.g. Echoes of Silence"
                                        onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Exhibition Type</label>
                                    <select className="form-select" value={form.exhibitionType}
                                        onChange={(e) => setForm({ ...form, exhibitionType: e.target.value })}>
                                        <option value="Solo">Solo Exhibition</option>
                                        <option value="Group">Group Exhibition</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                        <label className="form-label" style={{ marginBottom: 0 }}>Artists</label>
                                        <button type="button" onClick={addArtistEntry} className="btn btn--outline" style={{ padding: "2px 8px", fontSize: "0.6rem" }}>+ Add Artist</button>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "var(--cream)", padding: 16, borderRadius: 4 }}>
                                        {form.artists.length === 0 && <div style={{ fontSize: "0.8rem", color: "var(--grey-400)", fontStyle: "italic" }}>No artists added yet.</div>}
                                        {form.artists.map((entry, idx) => (
                                            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                                                <div style={{ flex: 1.5 }}>
                                                    <label style={{ fontSize: "0.6rem", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Select Artist (from DB)</label>
                                                    <ArtistSelect
                                                        allArtists={allArtists}
                                                        value={entry.artist || ""}
                                                        onChange={(val) => {
                                                            const newArtists = [...form.artists];
                                                            newArtists[idx].artist = val || undefined;
                                                            setForm({ ...form, artists: newArtists });
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ textAlign: "center", color: "var(--grey-300)", paddingBottom: 10 }}>or</div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ fontSize: "0.6rem", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Manual Name</label>
                                                    <input className="form-input" value={entry.manualName} placeholder="Text only"
                                                        onChange={(e) => {
                                                            const newArtists = [...form.artists];
                                                            newArtists[idx].manualName = e.target.value;
                                                            setForm({ ...form, artists: newArtists });
                                                        }} />
                                                </div>
                                                <button type="button" onClick={() => removeArtistEntry(idx)} style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: "1.2rem", paddingBottom: 8 }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Location Details</label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 12, border: "1px solid var(--grey-100)", padding: 16, borderRadius: 4 }}>
                                        <div className="form-group">
                                            <label style={{ fontSize: "0.7rem", marginBottom: 4, display: "block" }}>Location Name</label>
                                            <input className="form-input" value={form.location.name} placeholder="e.g. NOD FLOW Gallery"
                                                onChange={(e) => setForm({ ...form, location: { ...form.location, name: e.target.value } })} />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontSize: "0.7rem", marginBottom: 4, display: "block" }}>Address (Autosearch Helper)</label>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <input className="form-input" value={form.location.address} placeholder="e.g. Splaiul Unirii 160, Bucharest"
                                                    onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })} />
                                                <button type="button" className="btn btn--outline" style={{ fontSize: "0.6rem", whiteSpace: "nowrap" }}
                                                    onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(form.location.address || form.location.name)}`, "_blank")}>
                                                    Find →
                                                </button>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontSize: "0.7rem", marginBottom: 4, display: "block" }}>Google Maps URL</label>
                                            <input className="form-input" value={form.location.mapUrl} placeholder="https://goo.gl/maps/..."
                                                onChange={(e) => setForm({ ...form, location: { ...form.location, mapUrl: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
                                    <div className="form-group">
                                        <label className="form-label">Start Date</label>
                                        <input className="form-input" type="date" value={form.startDate}
                                            onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Ora Vernisaj</label>
                                        <select className="form-select" value={form.openingTime || ""}
                                            onChange={(e) => setForm({ ...form, openingTime: e.target.value })}>
                                            <option value="">-- None --</option>
                                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">End Date</label>
                                        <input className="form-input" type="date" value={form.endDate}
                                            onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
                                    <div className="form-group">
                                        <label className="form-label">Cover Image</label>
                                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                            <div style={{ width: 120, height: 80, background: "#eee", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                                                {form.coverImage ? (
                                                    <>
                                                        <img src={form.coverImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                        <button type="button" onClick={() => setForm({ ...form, coverImage: "" })}
                                                            style={{ position: "absolute", top: 4, right: 4, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer" }}>×</button>
                                                    </>
                                                ) : (
                                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#999" }}>NO IMAGE</div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <input type="file" onChange={async (e) => {
                                                    const file = e.target.files?.[0]; if (!file) return;
                                                    setUploading(true);
                                                    try {
                                                        const __fd = new FormData(); __fd.append("file", file); __fd.append("folder", "nodflo/content");
                                                        const res = await fetch("/api/upload", { method: "POST", body: __fd });
                                                        if (!res.ok) throw new Error("Upload failed");
                                                        const data = await res.json();
                                                        if (data.url) setForm(f => ({ ...f, coverImage: data.url }));
                                                    } catch (err) {
                                                        console.error("Upload error:", err);
                                                        alert("Failed to upload cover image");
                                                    } finally { setUploading(false); }
                                                }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Installation Views</label>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
                                            {form.images.map((img, i) => (
                                                <div key={i} style={{ position: "relative", aspectRatio: "4/3", background: "#eee" }}>
                                                    <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    <button onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                                                        style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 16, height: 16, fontSize: 8, cursor: "pointer" }}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                        <input type="file" multiple onChange={async (e) => {
                                            const files = Array.from(e.target.files || []); if (!files.length) return;
                                            setUploading(true);
                                            try {
                                                const urls: string[] = [];
                                                for (const file of files) {
                                                    const __fd = new FormData(); __fd.append("file", file); __fd.append("folder", "nodflo/content");
                                                    const res = await fetch("/api/upload", { method: "POST", body: __fd });
                                                    if (res.ok) {
                                                        const data = await res.json();
                                                        if (data.url) urls.push(data.url);
                                                    }
                                                }
                                                if (urls.length > 0) {
                                                    setForm(f => ({ ...f, images: [...f.images, ...urls] }));
                                                }
                                            } catch (err) {
                                                console.error("Gallery upload error:", err);
                                                alert("Some images failed to upload");
                                            } finally { setUploading(false); }
                                        }} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-textarea" rows={6} value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Exhibition concept and details..." />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Press Release / Extra Info</label>
                                    <textarea className="form-textarea" rows={6} value={form.pressRelease}
                                        onChange={(e) => setForm({ ...form, pressRelease: e.target.value })} placeholder="Curatorial text, press details..." />
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
                                                const __fd = new FormData(); __fd.append("file", file); __fd.append("folder", "nodflo/content");
                                                const res = await fetch("/api/upload", { method: "POST", body: __fd });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    if (data.url) setForm(f => ({ ...f, ogImage: data.url }));
                                                }
                                            }} />
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--grey-100)" }}>
                            <button onClick={() => setShowModal(false)} className="btn btn--outline">Cancel</button>
                            <button onClick={save} disabled={saving || uploading} className="btn btn--dark">
                                {saving ? "Saving..." : uploading ? "Uploading..." : editing ? "Update Exhibition" : "Create Exhibition"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
