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
    footerText: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/settings")
            .then((r) => r.json())
            .then((data) => {
                setSettings(data);
                setLoading(false);
            });
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!settings) return;
        setSaving(true); setMessage("");
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) setMessage("Settings saved successfully.");
            else setMessage("Error saving settings.");
        } catch (e) {
            setMessage("Connection error.");
        }
        setSaving(false);
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

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">Homepage & General Settings</h1>
                <button className="btn btn--dark" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save All Changes"}
                </button>
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

            <div style={{ display: "grid", gap: "32px" }}>
                {/* --- Hero Slideshow --- */}
                <section className="card" style={{ padding: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: 500 }}>Hero Slideshow</h2>
                        <button className="btn btn--outline" onClick={addSlide}>+ Add Slide</button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {settings?.heroSlides.map((slide, i) => (
                            <div key={i} style={{
                                padding: "24px", border: "1px solid #eee", borderRadius: "8px",
                                position: "relative", background: "#fafafa"
                            }}>
                                <button
                                    onClick={() => removeSlide(i)}
                                    style={{
                                        position: "absolute", top: "12px", right: "12px",
                                        color: "#ef4444", border: "none", background: "none", cursor: "pointer"
                                    }}
                                >
                                    Remove
                                </button>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                    <div className="form-group">
                                        <label className="form-label">Image URL</label>
                                        <input
                                            className="form-input" value={slide.img}
                                            onChange={(e) => updateSlide(i, "img", e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Eyebrow (Label)</label>
                                        <input
                                            className="form-input" value={slide.eyebrow}
                                            onChange={(e) => updateSlide(i, "eyebrow", e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Main Title</label>
                                        <input
                                            className="form-input" value={slide.title}
                                            onChange={(e) => updateSlide(i, "title", e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Subtitle / Description</label>
                                        <input
                                            className="form-input" value={slide.subtitle}
                                            onChange={(e) => updateSlide(i, "subtitle", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- General Branding --- */}
                <section className="card" style={{ padding: "32px" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: "24px" }}>Branding & Footer</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div className="form-group">
                            <label className="form-label">Gallery Name</label>
                            <input
                                className="form-input" value={settings?.galleryName}
                                onChange={(e) => setSettings({ ...settings!, galleryName: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Footer Copyright Text</label>
                            <input
                                className="form-input" value={settings?.footerText}
                                onChange={(e) => setSettings({ ...settings!, footerText: e.target.value })}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
