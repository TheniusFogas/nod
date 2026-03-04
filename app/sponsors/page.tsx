"use client";
import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function SponsorsPage() {
    const [sponsors, setSponsors] = useState<any[]>([]);
    const [cms, setCms] = useState<any>(null);

    useEffect(() => {
        fetch("/api/sponsors").then((r) => r.json()).then(setSponsors).catch(() => { });
        fetch("/api/pages?slug=sponsors").then((r) => r.json()).then(setCms).catch(() => { });
    }, []);

    const tiers = {
        gold: sponsors.filter(s => s.tier === 'gold'),
        silver: sponsors.filter(s => s.tier === 'silver'),
        partner: sponsors.filter(s => s.tier === 'partner')
    };

    const TierSection = ({ title, items, size }: { title: string, items: any[], size: number }) => {
        if (items.length === 0) return null;
        return (
            <div style={{ marginBottom: 80 }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--grey-400)", textAlign: "center", marginBottom: 48 }}>
                    {title}
                </h3>
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 64
                }}>
                    {items.map(s => (
                        <a key={s._id} href={s.website || "#"} target="_blank" rel="noopener noreferrer" style={{ opacity: 0.7, transition: "opacity 0.3s" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>
                            <img src={s.logo} alt={s.name} style={{ height: size, width: "auto", maxWidth: 220, objectFit: "contain", filter: "grayscale(100%) brightness(0.8)" }} />
                        </a>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <Nav />
            <div style={{ paddingTop: "var(--nav-h)" }}>
                <section className="section">
                    <div className="container" style={{ maxWidth: 1000 }}>
                        <div style={{ textAlign: "center", marginBottom: 120 }}>
                            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "4rem", fontWeight: 400, marginBottom: 24 }}>
                                {cms?.title || "Partners & Sponsors"}
                            </h1>
                            <p style={{ color: "var(--grey-400)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
                                {cms?.description || "We are grateful to our partners whose support allows us to continue bringing groundbreaking contemporary art to our community."}
                            </p>
                        </div>

                        <TierSection title="Main Partners" items={tiers.gold} size={150} />
                        <TierSection title="Supported By" items={tiers.silver} size={80} />
                        <TierSection title="Cultural Partners" items={tiers.partner} size={60} />

                        {sponsors.length === 0 && (
                            <p style={{ textAlign: "center", fontStyle: "italic", color: "var(--grey-600)", padding: 40 }}>
                                Partnerships coming soon.
                            </p>
                        )}
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
