"use client";
import { useState } from "react";

export default function NewsletterForm({ title = "Subscribe for Future Exhibitions" }: { title?: string }) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [form, setForm] = useState({ name: "", email: "", phone: "", role: "lover" });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setStatus("success");
                setForm({ name: "", email: "", phone: "", role: "lover" });
            } else {
                setStatus("error");
            }
        } catch { setStatus("error"); }
    }

    if (status === "success") {
        return (
            <div style={{ background: "var(--cream)", padding: "40px", textAlign: "center", borderRadius: "8px", border: "1px solid var(--grey-100)" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", marginBottom: "12px" }}>Thank You!</h3>
                <p style={{ color: "var(--grey-600)", fontSize: "0.9rem" }}>You have successfully subscribed to our newsletter. We'll keep you updated on upcoming exhibitions and events.</p>
            </div>
        );
    }

    return (
        <div style={{ background: "var(--cream)", padding: "40px", borderRadius: "8px", border: "1px solid var(--grey-100)" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", marginBottom: "24px", color: "var(--black)" }}>
                {title}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                    <label style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--grey-600)", marginBottom: "6px", display: "block" }}>Name</label>
                    <input
                        type="text"
                        required
                        className="form-input"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        style={{ background: "white", borderColor: "rgba(0,0,0,0.05)" }}
                    />
                </div>
                <div className="form-group">
                    <label style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--grey-600)", marginBottom: "6px", display: "block" }}>Email</label>
                    <input
                        type="email"
                        required
                        className="form-input"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        style={{ background: "white", borderColor: "rgba(0,0,0,0.05)" }}
                    />
                </div>
                <div className="form-group">
                    <label style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--grey-600)", marginBottom: "6px", display: "block" }}>Phone (Optional)</label>
                    <input
                        type="tel"
                        className="form-input"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="+40 ..."
                        style={{ background: "white", borderColor: "rgba(0,0,0,0.05)" }}
                    />
                </div>

                <div className="form-group">
                    <label style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--grey-600)", marginBottom: "12px", display: "block" }}>I am an...</label>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                            <input
                                type="radio"
                                name="role"
                                value="lover"
                                checked={form.role === "lover"}
                                onChange={e => setForm({ ...form, role: e.target.value })}
                                style={{ accentColor: "var(--black)" }}
                            />
                            Art Lover / Collector
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                            <input
                                type="radio"
                                name="role"
                                value="artist"
                                checked={form.role === "artist"}
                                onChange={e => setForm({ ...form, role: e.target.value })}
                                style={{ accentColor: "var(--black)" }}
                            />
                            Artist
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn--dark"
                    disabled={status === "loading"}
                    style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}
                >
                    {status === "loading" ? "Subscribing..." : "Join Newsletter"}
                </button>
                {status === "error" && <p style={{ color: "#e74c3c", fontSize: "0.8rem", textAlign: "center", marginTop: "8px" }}>Something went wrong. Please try again.</p>}
            </form>
            <p style={{ marginTop: "20px", fontSize: "0.7rem", color: "var(--grey-400)", lineHeight: "1.4", textAlign: "center" }}>
                By subscribing, you agree to receive updates via email and/or SMS. You can unsubscribe at any time.
            </p>
        </div>
    );
}
