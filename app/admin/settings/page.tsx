"use client";
import { useState, useEffect } from "react";

interface HeroSlide {
    img: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    link?: string;
}

interface SettingsData {
    heroSlides: HeroSlide[];
    galleryName: string;
    contactEmail: string;
    contactPhone: string;
    pressEmail: string;
    address: string;
    hours: string;
    mapUrl: string;
    footerDescription: string;
    footerText: string;
    homepageExtra2Content: string;
    homepageExtra2Image: string;
    googleVerification: string;
    customHeadScripts: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [original, setOriginal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
    const [availablePages, setAvailablePages] = useState<{ label: string; href: string }[]>([]);

    const isDirty = JSON.stringify(settings) !== JSON.stringify(original);

    useEffect(() => {
        fetch("/api/settings", { cache: "no-store" })
            .then((r) => r.json())
            .then((data) => {
                setSettings(data);
                setOriginal(data);
                setLoading(false);
            });
    }, []);

    // Build available pages list for nav link picker
    useEffect(() => {
        const staticPages = [
            { label: "Exhibitions", href: "/exhibitions" },
            { label: "Exhibitions: Current", href: "/exhibitions?type=current" },
            { label: "Exhibitions: Upcoming", href: "/exhibitions?type=upcoming" },
            { label: "Exhibitions: Archive", href: "/exhibitions?type=past" },
            { label: "Artists", href: "/artists" },
            { label: "News & Press", href: "/news" },
            { label: "Team", href: "/team" },
            { label: "Sponsors", href: "/sponsors" },
            { label: "Open Calls", href: "/open-calls" },
            { label: "Contact", href: "/contact" },
        ];
        Promise.all([
            fetch("/api/exhibitions").then(r => r.json()).catch(() => []),
            fetch("/api/news").then(r => r.json()).catch(() => []),
            fetch("/api/open-calls").then(r => r.json()).catch(() => []),
        ]).then(([exhibitions, news, openCalls]) => {
            const exPages = (Array.isArray(exhibitions) ? exhibitions : []).map((e: any) => ({ label: `Expo: ${e.title}`, href: `/exhibitions/${e.slug}` }));
            const newsPages = (Array.isArray(news) ? news : []).map((n: any) => ({ label: `News: ${n.title}`, href: `/news/${n._id}` }));
            const callPages = (Array.isArray(openCalls) ? openCalls : []).map((c: any) => ({ label: `Open Call: ${c.title}`, href: `/open-calls/${c.slug}` }));
            setAvailablePages([...staticPages, ...exPages, ...newsPages, ...callPages]);
        });
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    async function handleSave(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!settings) return;
        setSaving(true); setMessage("");
        console.log("Attempting to save settings:", settings);
        try {
            const { _id, __v, ...payload } = settings as any;
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            console.log("Save response:", result);
            if (res.ok) {
                setMessage("Settings saved successfully.");
                setOriginal(settings);
            } else {
                const errMsg = result.error || "Failed to save settings.";
                const details = result.details ? `: ${result.details.join(", ")}` : "";
                setMessage(`Error: ${errMsg}${details}`);
            }
        } catch (e) {
            console.error("Save error:", e);
            setMessage("Connection error. Check console.");
        }
        setSaving(false);
    }

    async function uploadFile(file: File, target: "hero" | "extra" | "extra2", index?: number) {
        const targetKey = index !== undefined ? `${target}-${index}` : target;
        setUploadingTarget(targetKey);
        setMessage("");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "settings");

        try {
            console.log(`Uploading file to ${target} via Vercel Blob...`);
            const res = await fetch(`/api/upload/blob?filename=${encodeURIComponent(file.name)}`, {
                method: "POST",
                body: file,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Upload failed");
            }

            const data = await res.json();
            console.log("Upload success, data:", data);

            if (data.url) {
                if (target === "hero" && typeof index === "number") {
                    updateSlide(index, "img", data.url);
                } else if (target === "extra") {
                    setSettings(prev => prev ? ({ ...prev, homepageExtraImage: data.url }) : null);
                } else if (target === "extra2") {
                    setSettings(prev => prev ? ({ ...prev, homepageExtra2Image: data.url }) : null);
                }
                setMessage("Image uploaded successfully! Please click 'Save All Changes' to persist.");
            } else {
                throw new Error("No URL in upload response");
            }
        } catch (err: any) {
            console.error("Upload process failed:", err);
            alert("Upload failed: " + err.message);
            setMessage(`Upload failed: ${err.message}`);
        } finally {
            setUploadingTarget(null);
        }
    }

    function updateSlide(index: number, field: keyof HeroSlide, value: string) {
        setSettings((prev: any) => {
            if (!prev) return null;
            const newSlides = [...prev.heroSlides];
            newSlides[index] = { ...newSlides[index], [field]: value };
            return { ...prev, heroSlides: newSlides };
        });
    }

    function addSlide() {
        setSettings((prev: any) => prev ? ({
            ...prev,
            heroSlides: [...prev.heroSlides, { img: "", eyebrow: "", title: "", subtitle: "" }]
        }) : null);
    }

    function removeSlide(index: number) {
        setSettings((prev: any) => prev ? ({
            ...prev,
            heroSlides: prev.heroSlides.filter((_: any, i: number) => i !== index)
        }) : null);
    }

    function moveSlide(index: number, direction: "up" | "down") {
        setSettings((prev: any) => {
            if (!prev) return null;
            const newSlides = [...prev.heroSlides];
            const newIndex = direction === "up" ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= newSlides.length) return prev;
            [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
            return { ...prev, heroSlides: newSlides };
        });
    }

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">Site Configuration</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {isDirty && <span style={{ color: "var(--accent-dark)", fontSize: "0.85rem", fontWeight: 600 }}>● Unsaved changes</span>}
                    <button className="btn btn--dark" onClick={() => handleSave()} disabled={saving || !isDirty || !!uploadingTarget}>
                        {saving ? "Saving..." : uploadingTarget ? "Wait for Upload..." : "Save All Changes"}
                    </button>
                </div>
            </div>

            {message && (
                <div style={{
                    padding: "16px", borderRadius: "4px", marginBottom: "24px",
                    background: message.includes("Error") ? "#fee2e2" : "#f0fdf4",
                    color: message.includes("Error") ? "#991b1b" : "#166534",
                    fontSize: "0.85rem"
                }}>
                    {message}
                </div>
            )}

            <div style={{ display: "grid", gap: "40px" }}>

                {/* --- Hero Slideshow --- */}
                <section className="card">
                    <div className="card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 className="card__title">Homepage Hero Slideshow</h2>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button className="btn btn--outline btn--sm" onClick={addSlide}>+ Add Slide</button>
                            {isDirty && (
                                <button className="btn btn--dark btn--sm" onClick={() => handleSave()} disabled={saving || !!uploadingTarget}>
                                    {saving ? "..." : uploadingTarget ? "wait" : "Save Now"}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="card__body" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {settings?.heroSlides.map((slide, i) => (
                            <div key={i} style={{
                                padding: "24px", border: "1px solid var(--grey-100)", borderRadius: "2px",
                                position: "relative", background: "#fff"
                            }}>
                                <div style={{
                                    position: "absolute", top: "12px", right: "12px",
                                    display: "flex", gap: "10px", alignItems: "center"
                                }}>
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        <button
                                            onClick={() => moveSlide(i, "up")}
                                            disabled={i === 0}
                                            style={{ cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? 0.3 : 1, border: "1px solid var(--grey-100)", background: "#fff", padding: "2px 6px", fontSize: "0.7rem" }}
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={() => moveSlide(i, "down")}
                                            disabled={i === settings.heroSlides.length - 1}
                                            style={{ cursor: i === settings.heroSlides.length - 1 ? "default" : "pointer", opacity: i === settings.heroSlides.length - 1 ? 0.3 : 1, border: "1px solid var(--grey-100)", background: "#fff", padding: "2px 6px", fontSize: "0.7rem" }}
                                        >
                                            ▼
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeSlide(i)}
                                        style={{
                                            color: "#ef4444", border: "none", background: "none", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600
                                        }}
                                    >
                                        REMOVE
                                    </button>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
                                    <div>
                                        <label className="form-label">Slide Image</label>
                                        <div style={{ position: "relative", marginBottom: "12px", minHeight: "120px", background: "var(--white-200)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {slide.img ? (
                                                <>
                                                    <img src={slide.img} style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                                                    <button
                                                        onClick={() => updateSlide(i, "img", "")}
                                                        style={{ position: "absolute", top: 8, right: 8, background: "#ef4444", color: "white", border: "none", borderRadius: "2px", padding: "4px 8px", fontSize: "0.6rem", cursor: "pointer" }}
                                                    >
                                                        REMOVE
                                                    </button>
                                                </>
                                            ) : (
                                                <span style={{ fontSize: "0.7rem", color: "var(--grey-400)" }}>No image</span>
                                            )}
                                            {uploadingTarget === `hero-${i}` && (
                                                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600 }}>
                                                    UPLOADING...
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            disabled={!!uploadingTarget}
                                            onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "hero", i)}
                                            style={{ fontSize: "0.7rem" }}
                                        />
                                        <input
                                            className="form-input" style={{ marginTop: "8px", fontSize: "0.75rem" }}
                                            placeholder="Or paste URL..."
                                            value={slide.img}
                                            onChange={(e) => updateSlide(i, "img", e.target.value)}
                                        />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                        <div className="form-group">
                                            <label className="form-label">Label (Eyebrow)</label>
                                            <input className="form-input" value={slide.eyebrow} onChange={(e) => updateSlide(i, "eyebrow", e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Link URL</label>
                                            <input className="form-input" value={slide.link || ""} onChange={(e) => updateSlide(i, "link", e.target.value)} />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: "span 2" }}>
                                            <label className="form-label">Main Title</label>
                                            <input className="form-input" value={slide.title} onChange={(e) => updateSlide(i, "title", e.target.value)} />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: "span 2" }}>
                                            <label className="form-label">Subtitle Text</label>
                                            <textarea className="form-input" value={slide.subtitle} rows={2} onChange={(e) => updateSlide(i, "subtitle", e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- Homepage Extra --- */}
                <section className="card">
                    <div className="card__header"><h2 className="card__title">Homepage Extra Section</h2></div>
                    <div className="card__body">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
                            <div>
                                <label className="form-label">Section Image</label>
                                <div style={{ position: "relative", marginBottom: "12px", minHeight: "150px", background: "var(--white-200)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {settings?.homepageExtraImage ? (
                                        <img src={settings.homepageExtraImage} style={{ width: "100%", height: "150px", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{ fontSize: "0.7rem", color: "var(--grey-400)" }}>No image</span>
                                    )}
                                    {uploadingTarget === "extra" && (
                                        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600 }}>
                                            UPLOADING...
                                        </div>
                                    )}
                                </div>
                                <input type="file" disabled={!!uploadingTarget} onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "extra")} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div className="form-group">
                                    <label className="form-label">Section Title</label>
                                    <input className="form-input" value={settings?.homepageExtraTitle || ""} onChange={(e) => setSettings(prev => prev ? ({ ...prev, homepageExtraTitle: e.target.value }) : null)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Section Content (HTML allowed)</label>
                                    <textarea className="form-input" rows={4} value={settings?.homepageExtraContent || ""} onChange={(e) => setSettings(prev => prev ? ({ ...prev, homepageExtraContent: e.target.value }) : null)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Homepage Extra 2 --- */}
                <section className="card">
                    <div className="card__header"><h2 className="card__title">Homepage Extra Section 2</h2></div>
                    <div className="card__body">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
                            <div>
                                <label className="form-label">Section Image</label>
                                <div style={{ position: "relative", marginBottom: "12px", minHeight: "150px", background: "var(--white-200)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {settings?.homepageExtra2Image ? (
                                        <img src={settings.homepageExtra2Image} style={{ width: "100%", height: "150px", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{ fontSize: "0.7rem", color: "var(--grey-400)" }}>No image</span>
                                    )}
                                    {uploadingTarget === "extra2" && (
                                        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600 }}>
                                            UPLOADING...
                                        </div>
                                    )}
                                </div>
                                <input type="file" disabled={!!uploadingTarget} onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "extra2")} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div className="form-group">
                                    <label className="form-label">Section Title</label>
                                    <input className="form-input" value={settings?.homepageExtra2Title || ""} onChange={(e) => setSettings(prev => prev ? ({ ...prev, homepageExtra2Title: e.target.value }) : null)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Section Content (HTML allowed)</label>
                                    <textarea className="form-input" rows={4} value={settings?.homepageExtra2Content || ""} onChange={(e) => setSettings(prev => prev ? ({ ...prev, homepageExtra2Content: e.target.value }) : null)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Contact Info --- */}
                <section className="card">
                    <div className="card__header"><h2 className="card__title">Contact & Location</h2></div>
                    <div className="card__body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        <div className="form-group">
                            <label className="form-label">Gallery Address</label>
                            <textarea className="form-input" rows={2} value={settings?.address || ""} onChange={(e) => setSettings(prev => prev ? ({ ...prev, address: e.target.value }) : null)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Opening Hours</label>
                            <textarea className="form-input" rows={2} value={settings?.hours || ""} onChange={(e) => setSettings(prev => prev ? ({ ...prev, hours: e.target.value }) : null)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">General Email</label>
                            <input className="form-input" value={settings?.contactEmail || ""} onChange={(e) => setSettings(prev => prev ? ({ ...prev, contactEmail: e.target.value }) : null)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Press Email</label>
                            <input className="form-input" value={settings?.pressEmail || ""} onChange={(e) => setSettings(prev => prev ? ({ ...prev, pressEmail: e.target.value }) : null)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Label / Number</label>
                            <input className="form-input" value={settings?.contactPhone || ""} onChange={(e) => setSettings(prev => prev ? ({ ...prev, contactPhone: e.target.value }) : null)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Google Maps Embed URL</label>
                            <input className="form-input" value={settings?.mapUrl || ""} onChange={(e) => setSettings(prev => prev ? ({ ...prev, mapUrl: e.target.value }) : null)} />
                        </div>
                    </div>
                </section>

                {/* --- Branding & Identity --- */}
                <section className="card">
                    <div className="card__header"><h2 className="card__title">Identitate Galerie</h2></div>
                    <div className="card__body" style={{ display: "grid", gap: "24px" }}>
                        <div className="form-group">
                            <label className="form-label">Nume Galerie (apare în nav și footer dacă nu ai logo)</label>
                            <input className="form-input" value={(settings as any)?.galleryName || ""} onChange={(e) => setSettings(prev => prev ? ({ ...prev, galleryName: e.target.value } as any) : null)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Logo (opțional — dacă este setat, înlocuiește numele)</label>
                            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                {(settings as any)?.logoUrl ? (
                                    <div style={{ position: "relative" }}>
                                        <img src={(settings as any).logoUrl} style={{ height: 40, objectFit: "contain", background: "#333", padding: 4, borderRadius: 2 }} />
                                        <button type="button" onClick={() => setSettings(prev => prev ? ({ ...prev, logoUrl: "" } as any) : null)}
                                            style={{ position: "absolute", top: -8, right: -8, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer" }}>×</button>
                                    </div>
                                ) : (
                                    <div style={{ width: 60, height: 40, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#999" }}>No logo</div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <input type="file" accept="image/*" onChange={async (e) => {
                                        const file = e.target.files?.[0]; if (!file) return;
                                        setUploadingTarget("logo");
                                        try {
                                            const res = await fetch(`/api/upload/blob?filename=${encodeURIComponent(file.name)}`, { method: "POST", body: file });
                                            const data = await res.json();
                                            if (data.url) setSettings(prev => prev ? ({ ...prev, logoUrl: data.url } as any) : null);
                                        } catch { alert("Upload failed"); } finally { setUploadingTarget(null); }
                                    }} />
                                    <input className="form-input" style={{ marginTop: 8, fontSize: "0.8rem" }} placeholder="Sau paste URL logo..."
                                        value={(settings as any)?.logoUrl || ""}
                                        onChange={(e) => setSettings(prev => prev ? ({ ...prev, logoUrl: e.target.value } as any) : null)} />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Footer Descriere Scurtă</label>
                            <textarea className="form-input" rows={3} value={(settings as any)?.footerDescription || ""} onChange={(e) => setSettings(prev => prev ? ({ ...prev, footerDescription: e.target.value } as any) : null)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Text Copyright</label>
                            <input className="form-input" value={(settings as any)?.footerText || ""} onChange={(e) => setSettings(prev => prev ? ({ ...prev, footerText: e.target.value } as any) : null)} />
                        </div>
                    </div>
                </section>

                {/* --- Navigation Links Editor --- */}
                <section className="card">
                    <div className="card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 className="card__title">Navigare (Meniu Principal)</h2>
                        <button className="btn btn--outline btn--sm" onClick={() => {
                            const nav = (settings as any)?.navLinks || [];
                            setSettings(prev => prev ? ({ ...prev, navLinks: [...nav, { label: "", href: "", children: [] }] } as any) : null);
                        }}>+ Adaugă Link</button>
                    </div>
                    <div className="card__body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <p style={{ fontSize: "0.8rem", color: "var(--grey-600)", margin: 0 }}>Dacă lista e goală, se folosesc link-urile implicite. Poți adăuga sub-pagini (dropdown) la fiecare link.</p>
                        {((settings as any)?.navLinks || []).map((link: any, i: number) => (
                            <div key={i} style={{ border: "1px solid var(--grey-100)", borderRadius: 4, padding: 16 }}>
                                <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                                    <input className="form-input" placeholder="Label (ex: Exhibitions)" value={link.label}
                                        onChange={(e) => {
                                            const nav = [...((settings as any)?.navLinks || [])];
                                            nav[i] = { ...nav[i], label: e.target.value };
                                            setSettings(prev => prev ? ({ ...prev, navLinks: nav } as any) : null);
                                        }} style={{ flex: 1 }} />
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                                        <select
                                            className="form-input"
                                            style={{ fontSize: "0.8rem" }}
                                            value={link.href}
                                            onChange={(e) => {
                                                if (!e.target.value) return;
                                                const nav = [...((settings as any)?.navLinks || [])];
                                                nav[i] = { ...nav[i], href: e.target.value };
                                                setSettings((prev: any) => prev ? ({ ...prev, navLinks: nav }) : null);
                                            }}
                                        >
                                            <option value="">— Alege din pagini existente —</option>
                                            {availablePages.map(p => <option key={p.href} value={p.href}>{p.label} ({p.href})</option>)}
                                        </select>
                                        <input className="form-input" placeholder="sau scrie URL manual (ex: /contact#visit)" value={link.href}
                                            onChange={(e) => {
                                                const nav = [...((settings as any)?.navLinks || [])];
                                                nav[i] = { ...nav[i], href: e.target.value };
                                                setSettings((prev: any) => prev ? ({ ...prev, navLinks: nav }) : null);
                                            }} style={{ fontSize: "0.8rem" }} />
                                    </div>
                                    <button type="button" onClick={() => {
                                        const nav = ((settings as any)?.navLinks || []).filter((_: any, j: number) => j !== i);
                                        setSettings(prev => prev ? ({ ...prev, navLinks: nav } as any) : null);
                                    }} style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.75rem" }}>✕ Șterge</button>
                                </div>
                                {/* Sub-pages */}
                                <div style={{ paddingLeft: 16, borderLeft: "2px solid var(--grey-100)", display: "flex", flexDirection: "column", gap: 6 }}>
                                    {(link.children || []).map((child: any, ci: number) => (
                                        <div key={ci} style={{ display: "flex", gap: 8 }}>
                                            <input className="form-input" placeholder="Label sub-pagină" value={child.label} style={{ flex: 1, fontSize: "0.8rem" }}
                                                onChange={(e) => {
                                                    const nav = [...((settings as any)?.navLinks || [])];
                                                    nav[i].children[ci] = { ...nav[i].children[ci], label: e.target.value };
                                                    setSettings(prev => prev ? ({ ...prev, navLinks: nav } as any) : null);
                                                }} />
                                            <input className="form-input" placeholder="URL" value={child.href} style={{ flex: 1, fontSize: "0.8rem" }}
                                                onChange={(e) => {
                                                    const nav = [...((settings as any)?.navLinks || [])];
                                                    nav[i].children[ci] = { ...nav[i].children[ci], href: e.target.value };
                                                    setSettings(prev => prev ? ({ ...prev, navLinks: nav } as any) : null);
                                                }} />
                                            <button type="button" onClick={() => {
                                                const nav = [...((settings as any)?.navLinks || [])];
                                                nav[i].children = nav[i].children.filter((_: any, j: number) => j !== ci);
                                                setSettings(prev => prev ? ({ ...prev, navLinks: nav } as any) : null);
                                            }} style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}>✕</button>
                                        </div>
                                    ))}
                                    <button type="button" style={{ alignSelf: "flex-start", fontSize: "0.75rem", color: "var(--accent-dark)", background: "none", border: "none", cursor: "pointer" }}
                                        onClick={() => {
                                            const nav = [...((settings as any)?.navLinks || [])];
                                            nav[i].children = [...(nav[i].children || []), { label: "", href: "" }];
                                            setSettings(prev => prev ? ({ ...prev, navLinks: nav } as any) : null);
                                        }}>+ Sub-pagină</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- Footer Columns Editor --- */}
                <section className="card">
                    <div className="card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 className="card__title">Footer — Coloane & Link-uri</h2>
                        <button className="btn btn--outline btn--sm" onClick={() => {
                            const cols = (settings as any)?.footerColumns || [];
                            setSettings(prev => prev ? ({ ...prev, footerColumns: [...cols, { title: "Coloana Nouă", links: [] }] } as any) : null);
                        }}>+ Coloană</button>
                    </div>
                    <div className="card__body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                        <p style={{ fontSize: "0.8rem", color: "var(--grey-600)", gridColumn: "1/-1", margin: 0 }}>Dacă nu configurezi coloane, se folosesc cele implicite.</p>
                        {((settings as any)?.footerColumns || []).map((col: any, ci: number) => (
                            <div key={ci} style={{ border: "1px solid var(--grey-100)", borderRadius: 4, padding: 16 }}>
                                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                                    <input className="form-input" placeholder="Titlu coloană" value={col.title} style={{ flex: 1, fontWeight: 600 }}
                                        onChange={(e) => {
                                            const cols = [...((settings as any)?.footerColumns || [])];
                                            cols[ci] = { ...cols[ci], title: e.target.value };
                                            setSettings(prev => prev ? ({ ...prev, footerColumns: cols } as any) : null);
                                        }} />
                                    <button type="button" onClick={() => {
                                        const cols = ((settings as any)?.footerColumns || []).filter((_: any, j: number) => j !== ci);
                                        setSettings(prev => prev ? ({ ...prev, footerColumns: cols } as any) : null);
                                    }} style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer", fontWeight: 600 }}>✕</button>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {(col.links || []).map((link: any, li: number) => (
                                        <div key={li} style={{ display: "flex", gap: 6 }}>
                                            <input className="form-input" placeholder="Label" value={link.label} style={{ flex: 1, fontSize: "0.8rem" }}
                                                onChange={(e) => {
                                                    const cols = [...((settings as any)?.footerColumns || [])];
                                                    cols[ci].links[li] = { ...cols[ci].links[li], label: e.target.value };
                                                    setSettings(prev => prev ? ({ ...prev, footerColumns: cols } as any) : null);
                                                }} />
                                            <input className="form-input" placeholder="URL" value={link.href} style={{ flex: 1, fontSize: "0.8rem" }}
                                                onChange={(e) => {
                                                    const cols = [...((settings as any)?.footerColumns || [])];
                                                    cols[ci].links[li] = { ...cols[ci].links[li], href: e.target.value };
                                                    setSettings(prev => prev ? ({ ...prev, footerColumns: cols } as any) : null);
                                                }} />
                                            <button type="button" onClick={() => {
                                                const cols = [...((settings as any)?.footerColumns || [])];
                                                cols[ci].links = cols[ci].links.filter((_: any, j: number) => j !== li);
                                                setSettings(prev => prev ? ({ ...prev, footerColumns: cols } as any) : null);
                                            }} style={{ color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}>✕</button>
                                        </div>
                                    ))}
                                    <button type="button" style={{ alignSelf: "flex-start", fontSize: "0.75rem", color: "var(--accent-dark)", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}
                                        onClick={() => {
                                            const cols = [...((settings as any)?.footerColumns || [])];
                                            cols[ci].links = [...(cols[ci].links || []), { label: "", href: "" }];
                                            setSettings(prev => prev ? ({ ...prev, footerColumns: cols } as any) : null);
                                        }}>+ Link</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            <div style={{ marginTop: "40px", display: "grid", gap: "24px" }}>
                <section className="card">
                    <div className="card__header"><h2 className="card__title">Rețele de Socializare</h2></div>
                    <div className="card__body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {[
                            { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/nodflo" },
                            { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/nodflo" },
                            { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@nodflo" },
                            { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@nodflo" },
                            { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/nodflo" },
                            { key: "x", label: "X (Twitter)", placeholder: "https://x.com/nodflo" },
                        ].map(({ key, label, placeholder }) => (
                            <div className="form-group" key={key}>
                                <label className="form-label">{label}</label>
                                <input
                                    className="form-input"
                                    placeholder={placeholder}
                                    value={(settings as any)?.socialLinks?.[key] || ""}
                                    onChange={(e) => setSettings((prev: any) => prev ? ({
                                        ...prev,
                                        socialLinks: { ...(prev.socialLinks || {}), [key]: e.target.value }
                                    }) : null)}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- SEO & Advanced --- */}
                <section className="card">
                    <div className="card__header"><h2 className="card__title">SEO & Advanced Scripts</h2></div>
                    <div className="card__body" style={{ display: "grid", gap: "24px" }}>
                        <div className="form-group">
                            <label className="form-label">Google Site Verification Code</label>
                            <input
                                className="form-input"
                                placeholder="e.g. jZ2S..."
                                value={settings?.googleVerification || ""}
                                onChange={(e) => setSettings((prev: any) => prev ? ({ ...prev, googleVerification: e.target.value }) : null)}
                            />
                            <p style={{ fontSize: "0.7rem", color: "var(--grey-400)", marginTop: 4 }}>
                                Find this in Google Search Console &gt; Settings &gt; Ownership Verification &gt; HTML Tag.
                            </p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Custom Head Scripts (Google Analytics, etc.)</label>
                            <textarea
                                className="form-input"
                                rows={6}
                                placeholder="<script>...</script>"
                                value={settings?.customHeadScripts || ""}
                                onChange={(e) => setSettings((prev: any) => prev ? ({ ...prev, customHeadScripts: e.target.value }) : null)}
                            />
                            <p style={{ fontSize: "0.7rem", color: "var(--grey-400)", marginTop: 4 }}>
                                BE CAREFUL: This code will be injected directly into the &lt;head&gt; of every page.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <div style={{ marginTop: "48px", textAlign: "right" }}>
                <button className="btn btn--dark" onClick={() => handleSave()} disabled={saving || !isDirty || !!uploadingTarget}>
                    {saving ? "Saving All Changes..." : uploadingTarget ? "Wait for Upload..." : "Save All Changes"}
                </button>
            </div>
        </div>
    );
}
