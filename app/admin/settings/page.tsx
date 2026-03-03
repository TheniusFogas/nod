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
    homepageExtraTitle: string;
    homepageExtraContent: string;
    homepageExtraImage: string;
    homepageExtra2Title: string;
    homepageExtra2Content: string;
    homepageExtra2Image: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [original, setOriginal] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const isDirty = JSON.stringify(settings) !== JSON.stringify(original);

    useEffect(() => {
        fetch("/api/settings")
            .then((r) => r.json())
            .then((data) => {
                setSettings(data);
                setOriginal(data);
                setLoading(false);
            });
    }, []);

    async function handleSave(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!settings) return;
        setSaving(true); setMessage("");
        console.log("Saving settings payload:", settings);
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                setMessage("Settings saved successfully.");
                setOriginal(settings);
            } else {
                setMessage("Error saving settings.");
            }
        } catch (e) {
            setMessage("Connection error.");
        }
        setSaving(false);
    }

    async function uploadFile(file: File, target: "hero" | "extra" | "extra2", index?: number) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "settings");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                if (target === "hero" && typeof index === "number") {
                    updateSlide(index, "img", data.url);
                } else if (target === "extra") {
                    setSettings({ ...settings!, homepageExtraImage: data.url });
                } else if (target === "extra2") {
                    setSettings({ ...settings!, homepageExtra2Image: data.url });
                }
                setMessage("Image uploaded! Don't forget to 'Save All Changes' below.");
            }
        } catch (err) {
            console.error("Upload failed", err);
        }
    }

    function updateSlide(index: number, field: keyof HeroSlide, value: string) {
        if (!settings) return;
        const newSlides = [...settings.heroSlides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setSettings({ ...settings, heroSlides: newSlides });
    }

    function addSlide() {
        if (!settings) return;
        setSettings({
            ...settings,
            heroSlides: [...settings.heroSlides, { img: "", eyebrow: "", title: "", subtitle: "" }]
        });
    }

    function removeSlide(index: number) {
        if (!settings) return;
        const newSlides = settings.heroSlides.filter((_, i) => i !== index);
        setSettings({ ...settings, heroSlides: newSlides });
    }

    function moveSlide(index: number, direction: "up" | "down") {
        if (!settings) return;
        const newSlides = [...settings.heroSlides];
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newSlides.length) return;

        [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
        setSettings({ ...settings, heroSlides: newSlides });
    }

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">Site Configuration</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {isDirty && <span style={{ color: "var(--accent-dark)", fontSize: "0.85rem", fontWeight: 600 }}>● Unsaved changes</span>}
                    <button className="btn btn--dark" onClick={() => handleSave()} disabled={saving || !isDirty}>
                        {saving ? "Saving..." : "Save All Changes"}
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
                                <button className="btn btn--dark btn--sm" onClick={() => handleSave()} disabled={saving}>
                                    {saving ? "Saving..." : "Save Now"}
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
                                        {slide.img && <img src={slide.img} style={{ width: "100%", height: "120px", objectFit: "cover", marginBottom: "12px" }} />}
                                        <input
                                            type="file"
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
                                            <input className="form-input" value={slide.link} onChange={(e) => updateSlide(i, "link", e.target.value)} />
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
                                {settings?.homepageExtraImage && <img src={settings.homepageExtraImage} style={{ width: "100%", height: "150px", objectFit: "cover", marginBottom: "12px" }} />}
                                <input type="file" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "extra")} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div className="form-group">
                                    <label className="form-label">Section Title</label>
                                    <input className="form-input" value={settings?.homepageExtraTitle} onChange={(e) => setSettings({ ...settings!, homepageExtraTitle: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Section Content (HTML allowed)</label>
                                    <textarea className="form-input" rows={4} value={settings?.homepageExtraContent} onChange={(e) => setSettings({ ...settings!, homepageExtraContent: e.target.value })} />
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
                                {settings?.homepageExtra2Image && <img src={settings.homepageExtra2Image} style={{ width: "100%", height: "150px", objectFit: "cover", marginBottom: "12px" }} />}
                                <input type="file" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "extra2")} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div className="form-group">
                                    <label className="form-label">Section Title</label>
                                    <input className="form-input" value={settings?.homepageExtra2Title || ""} onChange={(e) => setSettings({ ...settings!, homepageExtra2Title: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Section Content (HTML allowed)</label>
                                    <textarea className="form-input" rows={4} value={settings?.homepageExtra2Content || ""} onChange={(e) => setSettings({ ...settings!, homepageExtra2Content: e.target.value })} />
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
                            <textarea className="form-input" rows={2} value={settings?.address} onChange={(e) => setSettings({ ...settings!, address: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Opening Hours</label>
                            <textarea className="form-input" rows={2} value={settings?.hours} onChange={(e) => setSettings({ ...settings!, hours: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">General Email</label>
                            <input className="form-input" value={settings?.contactEmail} onChange={(e) => setSettings({ ...settings!, contactEmail: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Press Email</label>
                            <input className="form-input" value={settings?.pressEmail} onChange={(e) => setSettings({ ...settings!, pressEmail: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Label / Number</label>
                            <input className="form-input" value={settings?.contactPhone} onChange={(e) => setSettings({ ...settings!, contactPhone: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Google Maps Embed URL</label>
                            <input className="form-input" value={settings?.mapUrl} onChange={(e) => setSettings({ ...settings!, mapUrl: e.target.value })} />
                        </div>
                    </div>
                </section>

                {/* --- Branding & Footer --- */}
                <section className="card">
                    <div className="card__header"><h2 className="card__title">Branding & Footer</h2></div>
                    <div className="card__body" style={{ display: "grid", gap: "24px" }}>
                        <div className="form-group">
                            <label className="form-label">Gallery Display Name</label>
                            <input className="form-input" value={settings?.galleryName} onChange={(e) => setSettings({ ...settings!, galleryName: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Footer Short Description</label>
                            <textarea className="form-input" rows={3} value={settings?.footerDescription} onChange={(e) => setSettings({ ...settings!, footerDescription: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Copyright Text</label>
                            <input className="form-input" value={settings?.footerText} onChange={(e) => setSettings({ ...settings!, footerText: e.target.value })} />
                        </div>
                    </div>
                </section>

            </div>

            <div style={{ marginTop: "48px", textAlign: "right" }}>
                <button className="btn btn--dark" onClick={() => handleSave()} disabled={saving}>
                    {saving ? "Saving All Changes..." : "Save All Changes"}
                </button>
            </div>
        </div>
    );
}
