"use client";
import { useState, useEffect } from "react";

export default function AdminNewsletter() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState("");

    useEffect(() => {
        fetch("/api/newsletter").then((r) => r.json()).then((d) => setSubscribers(Array.isArray(d) ? d : []));
    }, []);

    const exportCSV = (mode: "all" | "email" | "phone") => {
        let headers = [];
        let rows = [];

        if (mode === "email") {
            headers = ["Email"];
            rows = subscribers.map(s => [s.email]);
        } else if (mode === "phone") {
            headers = ["Phone"];
            rows = subscribers.filter(s => s.phone).map(s => [s.phone]);
        } else {
            headers = ["Email", "Name", "Phone", "Joined"];
            rows = subscribers.map(s => [s.email, s.name || "", s.phone || "", new Date(s.createdAt).toISOString()]);
        }

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `subscribers_${mode}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    async function send(e: React.FormEvent) {
        e.preventDefault();
        if (!subject || !body) return;
        setSending(true); setResult("");
        const res = await fetch("/api/newsletter/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject, body }),
        });
        const data = await res.json();
        if (res.ok) setResult(`✓ Sent to ${data.sent} subscriber(s)`);
        else setResult(`✗ Error: ${data.error}`);
        setSending(false);
    }

    return (
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            <div className="admin-header">
                <div>
                    <h1 style={{ marginBottom: 4 }}>Newsletter</h1>
                    <p style={{ fontSize: "0.875rem", color: "var(--grey-600)" }}>
                        {subscribers.length} active subscriber{subscribers.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => exportCSV("all")} className="btn btn--outline" style={{ fontSize: "0.75rem" }}>Export CSV (All)</button>
                    <button onClick={() => exportCSV("email")} className="btn btn--outline" style={{ fontSize: "0.75rem" }}>Emails only</button>
                    <button onClick={() => exportCSV("phone")} className="btn btn--outline" style={{ fontSize: "0.75rem" }}>Phones only</button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.8fr)", gap: 24, alignItems: "start" }}>
                {/* Compose */}
                <div className="admin-card">
                    <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.3rem", marginBottom: 8 }}>
                        Compose Email
                    </h2>
                    <p style={{ fontSize: "0.8rem", color: "var(--grey-500)", marginBottom: 24 }}>
                        Emails are sent individually with a personal unsubscribe link.
                    </p>

                    <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div className="form-group">
                            <label className="form-label">Subject *</label>
                            <input className="form-input" required value={subject} onChange={(e) => setSubject(e.target.value)}
                                placeholder="Vernisaj: [Exhibition Title] — 15 March 2026" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Message *</label>
                            <textarea className="form-textarea" rows={12} required value={body} onChange={(e) => setBody(e.target.value)}
                                placeholder="Dragă {nume},&#10;&#10;Suntem încântați să te invităm la..." />

                            <div style={{ marginTop: 12, padding: "12px 16px", background: "var(--cream)", borderRadius: 6, border: "1px solid var(--grey-100)" }}>
                                <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--grey-600)", marginBottom: 6, fontWeight: 600 }}>Personalization Guide</div>
                                <div style={{ fontSize: "0.8rem", color: "var(--grey-700)", lineHeight: 1.5 }}>
                                    Use <strong>{`{nume}`}</strong> to insert the subscriber's name. <br />
                                    <span style={{ fontSize: "0.75rem", color: "var(--grey-500)" }}>Example: "Salut {`{nume}`}, te invităm la..." becomes "Salut Andrei, te invităm la..."</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <button type="submit" className="btn btn--dark" disabled={sending} id="newsletter-send-btn">
                                {sending ? "Sending..." : `Send to ${subscribers.length} subscribers`}
                            </button>
                            {result && (
                                <span style={{ fontSize: "0.85rem", color: result.startsWith("✓") ? "#1a6931" : "#c0392b" }}>
                                    {result}
                                </span>
                            )}
                        </div>
                    </form>
                </div>

                {/* Subscribers */}
                <div className="admin-card" style={{ padding: 0 }}>
                    <div style={{ padding: "24px 24px 0" }}>
                        <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.3rem", marginBottom: 20 }}>
                            Subscribers
                        </h2>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Since</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.length === 0 && (
                                    <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--grey-600)", fontStyle: "italic", padding: 40 }}>No subscribers yet.</td></tr>
                                )}
                                {subscribers.map((s) => (
                                    <tr key={s._id}>
                                        <td style={{ fontWeight: 500 }}>{s.email}</td>
                                        <td>{s.name || "—"}</td>
                                        <td>{s.phone || <span style={{ opacity: 0.3 }}>—</span>}</td>
                                        <td style={{ fontSize: "0.8rem", color: "var(--grey-600)" }}>
                                            {new Date(s.createdAt).toLocaleDateString("en-GB")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
