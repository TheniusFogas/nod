import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import dbConnect from "@/lib/db";
import { Exhibition } from "@/models/Exhibition";
import { Artist } from "@/models/Artist";
import { notFound } from "next/navigation";
import { ExhibitionDetailClient } from "@/components/ExhibitionDetailClient";
import { CalendarButton } from "@/components/CalendarButton";
import type { Metadata } from "next";
import { cache } from "react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

// Senior Architecture: Incremental Static Regeneration (ISR)
export const revalidate = 3600; // Cache for 1 hour, background reval

/**
 * Senior Architecture: Memoized Data Fetching
 * Uses React cache() to prevent duplicate DB queries between generateMetadata and the Page component.
 * Uses .lean() for raw POJO performance and .select() for memory-efficient projections.
 */
const getExhibition = cache(async (slug: string) => {
    await dbConnect();
    const rawRes = await Exhibition.findOne({ slug })
        .populate({
            path: 'artists.artist',
            select: 'name slug profileImage' // Only fetch what's needed
        })
        .select('-__v -updatedAt')
        .lean();

    if (!rawRes) return null;

    // Deep Serialization for Serverless/Edge safety
    return JSON.parse(JSON.stringify(rawRes));
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const { slug } = await params;
        const ex = await getExhibition(slug);
        if (!ex) return { title: "Exhibition Not Found | NOD FLOW" };

        const title = ex.seoTitle || `${ex.title} | NOD FLOW`;
        const description = ex.seoDescription || ex.description?.slice(0, 160) || "Exhibition at NOD FLOW Gallery.";
        const ogImage = ex.ogImage || ex.coverImage || "https://nodflo.com/og-default.jpg";

        return {
            title,
            description,
            openGraph: { title, description, images: [ogImage], type: "article" },
            twitter: { card: "summary_large_image", title, description, images: [ogImage] }
        };
    } catch (err: any) {
        return { title: "Exhibition | NOD FLOW" };
    }
}

export default async function ExhibitionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let exhibition: any = null;

    try {
        exhibition = await getExhibition(slug);
    } catch (err: any) {
        console.error(`[EXHIBITION_ERROR] Failed to fetch or serialize exhibition "${slug}":`, err);
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <Nav />
                <h1 style={{ marginTop: 100 }}>Something went wrong loading this exhibition.</h1>
                <p className="text-muted">Error Details: {err.message || "Unknown Error"}</p>
                <Footer />
            </div>
        );
    }

    if (!exhibition) return notFound();

    try {
        const artistsArray = Array.isArray(exhibition.artists) ? exhibition.artists : [];
        const uiArtists = artistsArray
            .filter((item: any) => item && (item.artist || item.manualName))
            .map((a: any) => ({
                name: a.artist?.name || a.manualName || "Unnamed Artist",
                slug: a.artist?.slug || "",
                manualName: a.manualName,
                artistId: a.artist?._id || null
            }));

        const locName = exhibition.location?.name || (typeof exhibition.location === 'string' ? exhibition.location : "NOD FLOW Gallery");
        const locAddress = exhibition.location?.address || "";
        const locMapUrl = exhibition.location?.mapUrl || "";

        return (
            <>
                <Nav dark />
                <div className="exhibition-hero">
                    {exhibition.coverImage && (
                        <div style={{ width: "100%", height: "100%", position: "relative" }}>
                            <Image
                                src={exhibition.coverImage}
                                alt={exhibition.title}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 1200px"
                                style={{ objectFit: "cover" }}
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
                                uiArtists[0]?.name || exhibition.artist || ""
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

                                <ExhibitionDetailClient images={exhibition.images || []} />
                            </div>

                            <aside className="exhibition-sidebar-wrapper">
                                <div className="exhibition-sidebar__sticky">
                                    <div className="exhibition-sidebar__info">
                                        <div>
                                            <div style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--grey-600)", marginBottom: 8 }}>Artists</div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                {uiArtists.length > 0 ? (
                                                    uiArtists.map((uiArtist: any) => (
                                                        <div key={uiArtist.artistId || uiArtist.slug || uiArtist.name}>
                                                            {uiArtist.slug ? (
                                                                <Link href={`/artists/${uiArtist.slug}`} className="artist-detail-link">
                                                                    {uiArtist.name}
                                                                </Link>
                                                            ) : (
                                                                <span>{uiArtist.name}</span>
                                                            )}
                                                        </div>
                                                    ))
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
                                            <CalendarButton
                                                title={exhibition.title}
                                                startDate={exhibition.startDate}
                                                endDate={exhibition.endDate}
                                                description={exhibition.description}
                                                locName={locName}
                                                locAddr={locAddress}
                                            />
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
    } catch (err: any) {
        console.error(`[RENDER_ERROR] Failed to render exhibition page for "${slug}":`, err);
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <Nav />
                <h1 style={{ marginTop: 100 }}>Something went wrong rendering this exhibition.</h1>
                <p className="text-muted">{err.message || "Rendering error"}</p>
                <Footer />
            </div>
        );
    }
}
