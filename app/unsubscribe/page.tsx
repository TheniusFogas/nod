"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        if (!email) {
            setStatus("error");
            return;
        }

        fetch("/api/newsletter/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        })
            .then(res => res.ok ? setStatus("success") : setStatus("error"))
            .catch(() => setStatus("error"));
    }, [email]);

    return (
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
            {status === "loading" && <p>Procesăm cererea ta...</p>}
            {status === "success" && (
                <>
                    <h1 style={{ fontFamily: "var(--font-serif)", marginBottom: 20 }}>Te-ai dezabonat cu succes</h1>
                    <p style={{ color: "var(--grey-600)" }}>Adresa {email} a fost eliminată din lista noastră.</p>
                </>
            )}
            {status === "error" && (
                <>
                    <h1 style={{ fontFamily: "var(--font-serif)", marginBottom: 20 }}>Ups! Ceva n-a mers bine</h1>
                    <p style={{ color: "var(--grey-600)" }}>Nu am putut procesa dezabonarea. Te rugăm să încerci mai târziu sau să ne contactezi.</p>
                </>
            )}
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <>
            <Nav />
            <div style={{ paddingTop: "var(--nav-h)", minHeight: "60vh" }}>
                <Suspense fallback={<div style={{ textAlign: "center", padding: 100 }}>Se încarcă...</div>}>
                    <UnsubscribeContent />
                </Suspense>
            </div>
            <Footer />
        </>
    );
}
