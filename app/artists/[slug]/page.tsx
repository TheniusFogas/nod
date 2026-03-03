"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ArtistDetailPage() {
    const params = useParams();
    const [artist, setArtist] = useState<any>(null);

    const ensureExternalLink = (url: string) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `https://${url}`;
    };

    useEffect(() => {
        fetch("/api/artists")
            .then((r) => r.json())
            .then((data: any[]) => {
                setArtist(data.find((a) => a.slug === params.slug) || null);
            })
            .catch(() => { });
    }, [params.slug]);

    if (!artist) {
        return (
            <>
                <Nav />
                <div style={{ paddingTop: "var(--nav-h)", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p className="text-muted">Loading...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Nav />
            <div style={{ paddingTop: "var(--nav-h)" }}>
                <section className="section">
                    <div className="container">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 80, alignItems: "start" }}>
                            <div>
                                {artist.photo && (
                                    <img src={artist.photo} alt={artist.name} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", marginBottom: 24 }} />
                                )}
                                {artist.nationality && (
                                    <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--grey-600)", marginBottom: 8 }}>
                                        {artist.nationality}
                                    </p>
                                )}
                                {artist.website && (
                                    <a href={ensureExternalLink(artist.website)} target="_blank" rel="noopener noreferrer" className="btn btn--outline" style={{ marginTop: 16 }}>
                                        Website →
                                    </a>
                                )}
                            </div>
                            <div>
                                <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "clamp(2rem,4vw,3.5rem)", marginBottom: 32 }}>
                                    {artist.name}
                                </h1>
                                {artist.bio && (
                                    <p style={{ lineHeight: 1.9, fontSize: "1rem" }}>{artist.bio}</p>
                                )}
                                {artist.images?.length > 0 && (
                                    <>
                                        <hr className="divider" />
                                        <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, marginBottom: 24 }}>Works</h3>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                                            {artist.images.map((img: string, i: number) => (
                                                <img key={i} src={img} alt={`Work ${i + 1}`} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <hr className="divider" />
                        <Link href="/artists" className="btn btn--outline">← All Artists</Link>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
