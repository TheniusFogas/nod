"use client";

import { useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // In a production environment, this should log to Sentry, Axiom, or Datadog.
        console.error("Exhibition Route Error Caught by Boundary:", error);
    }, [error]);

    return (
        <>
            <Nav />
            <div style={{ paddingTop: "var(--nav-h)", minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 400 }}>Something went wrong</h1>
                <p className="text-muted" style={{ maxWidth: 500, textAlign: "center" }}>
                    We encountered an unexpected error loading this exhibition. Our technical team has been notified.
                </p>
                <button
                    onClick={() => reset()}
                    className="btn btn--dark"
                >
                    Try Again
                </button>
            </div>
            <Footer />
        </>
    );
}
