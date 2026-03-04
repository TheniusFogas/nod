"use client";
import { useState } from "react";
import Link from "next/link";

function formatDate(d: string) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function OpenCallClient({ call }: { call: any }) {
    const [form, setForm] = useState({
        artistName: "", email: "", phone: "", website: "", videoLink: "", statement: "", agreeToContact: false
    });
    const [images, setImages] = useState<File[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > 5) {
            setError("Maximum 5 images allowed.");
            return;
        }
        const largeFiles = files.filter(f => f.size > 15 * 1024 * 1024);
        if (largeFiles.length > 0) {
            setError("Some files exceed the 15MB limit.");
            return;
        }
        setImages([...images, ...files]);
        setError("");
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError("");

        try {
            const formData = new FormData();
            formData.append("artistName", form.artistName);
            formData.append("email", form.email);
            formData.append("phone", form.phone);
            formData.append("website", form.website);
            formData.append("videoLink", form.videoLink);
            formData.append("statement", form.statement);
            formData.append("agreeToContact", String(form.agreeToContact));

            images.forEach((img) => formData.append("images", img));

            const res = await fetch(`/api/open-calls/${call._id}/apply`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) setSubmitted(true);
            else {
                const data = await res.json();
                setError(data.error || "Something went wrong. Please try again.");
            }
        } catch {
            setError("Failed to submit. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 800 }}>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: call.isActive ? "var(--accent-dark)" : "var(--grey-600)", marginBottom: 16 }}>
                {call.isActive ? "Open Call" : "Closed"}
            </div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, marginBottom: 24 }}>{call.title}</h1>
            {call.deadline && (
                <p style={{ fontSize: "0.85rem", color: "var(--grey-600)", marginBottom: 40 }}>
                    Deadline: <strong>{formatDate(call.deadline)}</strong>
                </p>
            )}

            {call.description && (
                <div style={{ lineHeight: 1.85, marginBottom: 40, whiteSpace: "pre-wrap" }}>
                    <p>{call.description}</p>
                </div>
            )}

            {call.requirements && (
                <div style={{ marginBottom: 48 }}>
                    <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, marginBottom: 16 }}>Requirements</h3>
                    <p style={{ lineHeight: 1.85, color: "var(--grey-400)", marginBottom: 40, whiteSpace: "pre-wrap" }}>{call.requirements}</p>
                </div>
            )}

            {call.isActive && (
                <>
                    <hr className="divider" />
                    <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, marginBottom: 32 }}>Apply Now</h2>
                    {submitted ? (
                        <div style={{ padding: "64px", background: "var(--cream)", textAlign: "center", borderRadius: 4 }}>
                            <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, marginBottom: 12 }}>Application Under Review</h3>
                            <p style={{ color: "var(--grey-400)" }}>Thank you for your submission. We will review your materials and get back to you soon.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input className="form-input" required value={form.artistName}
                                        onChange={(e) => setForm({ ...form, artistName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input className="form-input" type="email" required value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input className="form-input" value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Website</label>
                                    <input className="form-input" type="url" value={form.website}
                                        placeholder="https://..."
                                        onChange={(e) => setForm({ ...form, website: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Video Link (YouTube/Vimeo)</label>
                                <input className="form-input" type="url" value={form.videoLink}
                                    placeholder="https://..."
                                    onChange={(e) => setForm({ ...form, videoLink: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Artist Statement *</label>
                                <textarea className="form-textarea" required rows={6} value={form.statement}
                                    placeholder="Tell us about your work and why you are applying..."
                                    onChange={(e) => setForm({ ...form, statement: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Work Samples (Images, Max 5, 15MB each) *</label>
                                <div style={{ border: "1px dashed var(--grey-100)", padding: 24, textAlign: "center", background: "var(--cream)", borderRadius: 2 }}>
                                    <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: "none" }} id="images-upload" />
                                    <label htmlFor="images-upload" style={{ cursor: "pointer", color: "var(--accent-dark)", fontSize: "0.9rem" }}>
                                        {images.length < 5 ? "+ Click to upload images" : "Max images reached"}
                                    </label>
                                    <div style={{ display: "flex", gap: 12, marginTop: 16, overflowX: "auto", paddingBottom: 8 }}>
                                        {images.map((file, i) => (
                                            <div key={i} style={{ position: "relative", minWidth: 80, height: 80, background: "#eee", borderRadius: 2 }}>
                                                <img src={URL.createObjectURL(file)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                <button type="button" onClick={() => removeImage(i)} style={{ position: "absolute", top: -8, right: -8, background: "#ff4444", color: "white", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 10, cursor: "pointer" }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                <input type="checkbox" id="consent" style={{ marginTop: 4 }} checked={form.agreeToContact} onChange={(e) => setForm({ ...form, agreeToContact: e.target.checked })} />
                                <label htmlFor="consent" style={{ fontSize: "0.85rem", color: "var(--grey-600)", cursor: "pointer" }}>
                                    Sunt de acord să fiu contactat și anunțat de viitoare open-call-uri și noutăți ale galeriei.
                                </label>
                            </div>

                            {error && <p style={{ color: "#c0392b", fontSize: "0.85rem", padding: "12px", background: "#fdf2f2", borderRadius: 2 }}>{error}</p>}

                            <div>
                                <button type="submit" className="btn btn--dark btn--lg" disabled={loading || images.length === 0} id="apply-submit-btn">
                                    {loading ? "Processing Application..." : "Submit Application →"}
                                </button>
                                {images.length === 0 && !loading && <p style={{ fontSize: "0.75rem", color: "var(--grey-400)", marginTop: 8 }}>* Please upload at least one work sample.</p>}
                            </div>
                        </form>
                    )}
                </>
            )}

            <hr className="divider" />
            <Link href="/open-calls" className="btn btn--outline">← All Open Calls</Link>
        </div>
    );
}
