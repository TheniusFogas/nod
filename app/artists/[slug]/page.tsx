"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Image from "next/image";

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
                                {((artist.profileImage && artist.profileImage.url) || artist.photo) && (
                                    <div style={{ width: "100%", aspectRatio: "3/4", position: "relative", marginBottom: 24, backgroundColor: "var(--cream)" }}>
                                        <Image
                                            src={artist.profileImage?.url || artist.photo}
                                            alt={artist.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            priority={true}
                                            placeholder={artist.profileImage?.blurDataURL ? "blur" : "empty"}
                                            blurDataURL={artist.profileImage?.blurDataURL}
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
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
                                <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "clamp(2.5rem,5vw,4rem)", marginBottom: 8, lineHeight: 1.1 }}>
                                    {artist.name}
                                </h1>
                                {artist.membership === "Platinum" && (
                                    <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent-dark)", marginBottom: 32 }}>
                                        Platinum Member
                                    </div>
                                )}

                                {artist.bio && (
                                    <div style={{ fontSize: "1.1rem", fontStyle: "italic", color: "var(--grey-600)", borderLeft: "2px solid var(--accent-light)", paddingLeft: 24, marginBottom: 40, lineHeight: 1.6 }}>
                                        {artist.bio}
                                    </div>
                                )}

                                {artist.content && (
                                    <div
                                        className="rich-text"
                                        style={{ lineHeight: 1.9, fontSize: "1rem", marginBottom: 64 }}
                                        dangerouslySetInnerHTML={{ __html: artist.content }}
                                    />
                                )}

                                {artist.gallery?.length > 0 && (
                                    <>
                                        <hr className="divider" />
                                        <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, marginBottom: 32 }}>Artworks</h3>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                                            {artist.gallery.map((img: string, i: number) => (
                                                <div key={i} style={{ borderRadius: 2, overflow: "hidden", background: "var(--cream)" }}>
                                                    <img src={img} alt={`${artist.name} Work ${i + 1}`} style={{ width: "100%", height: "auto", display: "block" }} />
                                                </div>
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
