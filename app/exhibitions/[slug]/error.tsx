"use client";
import { useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ExhibitionError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the real error to the console for Vercel/Local monitoring
        console.error("[EXHIBITION_CRITICAL_ERROR]:", error);
    }, [error]);

    return (
        <div style={{ padding: 40, textAlign: "center", minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Nav />
            <div className="container">
                <h1 style={{ color: "var(--accent-dark)", marginBottom: 20 }}>Exhibition Loading Error</h1>
                <p style={{ fontSize: "1.1rem", marginBottom: 32 }}>
                    The system encountered a runtime exception while preparing this page.
                </p>

                <div style={{ background: "var(--cream)", padding: 24, borderRadius: 8, textAlign: "left", marginBottom: 40, overflowX: "auto" }}>
                    <p style={{ fontWeight: 600, color: "var(--grey-800)", marginBottom: 8 }}>Diagnostic Message:</p>
                    <code style={{ color: "var(--accent-dark)", fontSize: "0.9rem" }}>
                        {error.message || "Unknown Runtime Error"}
                    </code>
                    {error.digest && (
                        <p style={{ marginTop: 16, fontSize: "0.8rem", color: "var(--grey-500)" }}>
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>

                <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                    <button onClick={() => reset()} className="btn btn--primary">
                        Retry Rendering
                    </button>
                    <a href="/exhibitions" className="btn btn--outline">
                        Back to Exhibitions
                    </a>
                </div>
            </div>
            <Footer />
        </div>
    );
}
