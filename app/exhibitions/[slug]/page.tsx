import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import dbConnect from "@/lib/db";
import Exhibition from "@/models/Exhibition";
import Artist from "@/models/Artist"; // Critical for populate
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { ExhibitionDetailClient } from "@/components/ExhibitionDetailClient";
import { CalendarButton } from "@/components/CalendarButton";

function formatDate(d: any) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

import type { Metadata } from "next";

export const dynamic = "force-dynamic";



/*
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        await dbConnect();
        const { slug } = await params;
        const rawExhibition = await Exhibition.findOne({ slug }).populate('artists.artist').lean() as any;
        const exhibition = JSON.parse(JSON.stringify(rawExhibition));

        if (!exhibition) return { title: "Exhibition Not Found | NOD FLOW" };

        const title = exhibition.seoTitle || `${exhibition.title} | NOD FLOW`;
        const description = exhibition.seoDescription || exhibition.description?.slice(0, 160) || "Exhibition at NOD FLOW Gallery.";
        const ogImage = exhibition.ogImage || exhibition.coverImage || "https://nodflo.com/og-default.jpg";

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: [ogImage],
                type: "article",
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [ogImage],
            }
        };
    } catch (err: any) {
        return { title: `Error: ${err.message}` };
    }
}
*/

export default async function ExhibitionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    await dbConnect();
    const { slug } = await params;

    // EXECUTIE FINALA:
    const rawExhibition = await Exhibition.findOne({ slug }).populate('artists.artist').lean() as any;

    if (!rawExhibition) {
        return notFound();
    }

    // Aceasta este SINGURA cale prin care garantam ca obiectul e "curat"
    const exhibition = JSON.parse(JSON.stringify(rawExhibition));

    const locName = exhibition.location?.name || (typeof exhibition.location === 'string' ? exhibition.location : "NOD FLOW Gallery");
    const locAddress = exhibition.location?.address || "";
    const locMapUrl = exhibition.location?.mapUrl || "";

    return (
        <>
            <Nav dark />

            {/* Exhibition Hero */}
            <div className="exhibition-hero">
                {exhibition.coverImage && (
                    <div style={{ width: "100%", height: "100%", position: "relative" }}>
                        <img
                            src={exhibition.coverImage}
                            alt={exhibition.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>
                )}
                <div className="exhibition-hero__info">
                    <div style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 16 }}>
                        {exhibition.type === "current" ? "On View" : exhibition.type === "upcoming" ? "Upcoming" : "Past"}
                    </div>
                    <h1 style={{ fontFamily: "var(--font-serif)", color: "var(--white)", fontWeight: 400, fontSize: "clamp(2rem,5vw,4rem)", marginBottom: 12 }}>
                        {exhibition.title}
                    </h1>
                    <div style={{ color: "rgba(245,244,240,0.75)", fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontStyle: "italic", marginBottom: 20 }}>
                        {exhibition.exhibitionType === "Group" ? (
                            "Group Exhibition"
                        ) : (
                            exhibition.artists?.[0]?.artist?.name || exhibition.artists?.[0]?.manualName || exhibition.artist || ""
                        )}
                    </div>
                    <p style={{ color: "rgba(245,244,240,0.5)", fontSize: "0.8rem", letterSpacing: "0.08em" }}>
                        {formatDate(exhibition.startDate)} — {formatDate(exhibition.endDate)} &nbsp;·&nbsp; {locName}
                    </p>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    <div className="exhibition-main-flex">
                        <div>
                            {exhibition.description && (
                                <>
                                    <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.5rem", marginBottom: 24 }}>
                                        About the Exhibition
                                    </h2>
                                    <p style={{ lineHeight: 1.9, fontSize: "1.05rem", color: "var(--grey-800)" }}>{exhibition.description}</p>
                                </>
                            )}

                            {exhibition.pressRelease && (
                                <>
                                    <hr className="divider" />
                                    <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, marginBottom: 16 }}>Press Release</h3>
                                    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.9, color: "var(--grey-700)" }}>{exhibition.pressRelease}</div>
                                </>
                            )}

                            {/* Image Gallery stays interactive via Client Component */}
                            <ExhibitionDetailClient images={exhibition.images || []} />
                        </div>

                        {/* Sidebar */}
                        <aside className="exhibition-sidebar-wrapper">
                            <div className="exhibition-sidebar__sticky">
                                <div className="exhibition-sidebar__info">
                                    <div>
                                        <div style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--grey-600)", marginBottom: 8 }}>Artists</div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            {exhibition.artists && exhibition.artists.length > 0 ? (
                                                exhibition.artists.filter((a: any) => a !== null && a !== undefined).map((a: any, i: number) => {
                                                    return (
                                                        <div key={i}>
                                                            {a.artist && a.artist.slug ? (
                                                                <Link href={`/artists/${a.artist.slug}`} className="artist-detail-link">
                                                                    {a.artist.name || "Unnamed Artist"}
                                                                </Link>
                                                            ) : (
                                                                <span>{a.manualName || a.artist?.name || "Unknown"}</span>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}>{exhibition.artist || "Individual Exhibition"}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--grey-600)", marginBottom: 8 }}>Dates</div>
                                        <div style={{ marginBottom: 12 }}>
                                            {formatDate(exhibition.startDate)} — {formatDate(exhibition.endDate)}
                                        </div>
                                        <CalendarButton exhibition={exhibition} />
                                    </div>

                                    <div>
                                        <div style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--grey-600)", marginBottom: 8 }}>Location</div>
                                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{locName}</div>
                                        {locAddress && <div style={{ fontSize: "0.9rem", color: "var(--grey-600)", marginBottom: 12 }}>{locAddress}</div>}
                                        {locMapUrl && (
                                            <a href={locMapUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 500 }}>
                                                View on Map ↗
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <NewsletterForm />
                            </div>
                        </aside>
                    </div>

                    <div style={{ marginTop: 80, borderTop: "1px solid var(--grey-100)", paddingTop: 40 }}>
                        <Link href="/exhibitions" className="btn btn--outline">← Back to Exhibitions</Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
