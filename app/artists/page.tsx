import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Image from "next/image";
import dbConnect from "@/lib/db";
import { Artist } from "@/models/Artist";
import { PageContent } from "@/models/PageContent";
import type { Metadata } from "next";
import { cache } from "react";

const FALLBACK = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80";

// Senior Architecture: Incremental Static Regeneration (ISR)
export const revalidate = 3600;

/**
 * Senior Architecture: Memoized Data Fetching
 */
const getArtistsData = cache(async () => {
    await dbConnect();
    const [rawArtists, rawCms] = await Promise.all([
        Artist.find({}).select('name slug bio profileImage photo membership order').lean(),
        PageContent.findOne({ slug: "artists" }).select('title description seoTitle seoDescription ogImage sidebarTitle sidebarContent').lean()
    ]);

    return JSON.parse(JSON.stringify({ artists: rawArtists, cms: rawCms }));
});

export async function generateMetadata(): Promise<Metadata> {
    const { cms } = await getArtistsData();
    const title = cms?.seoTitle || "Artists | NOD FLOW";
    const description = cms?.seoDescription || cms?.description?.slice(0, 160) || "Artists represented and exhibited by NOD FLOW.";
    const ogImage = cms?.ogImage || "https://nodflo.com/og-default.jpg";

    return {
        title,
        description,
        openGraph: { title, description, images: [ogImage] }
    };
}

export default async function ArtistsPage() {
    const { artists: artistsRaw, cms } = await getArtistsData();

    const getRank = (membership: string) => {
        const m = membership?.toLowerCase() || "";
        if (m === "platinum") return 1;
        if (m === "gold") return 2;
        if (m === "silver") return 3;
        if (m === "bronze") return 4;
        return 5;
    };

    const artists = artistsRaw.sort((a: any, b: any) => {
        const rankA = getRank(a.membership);
        const rankB = getRank(b.membership);
        if (rankA !== rankB) return rankA - rankB;
        if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
        return (a.name || "").localeCompare(b.name || "");
    });

    return (
        <>
            <Nav />
            <div style={{ paddingTop: "var(--nav-h)" }}>
                <section className="section">
                    <div className="container">
                        <div style={{ display: "grid", gridTemplateColumns: (cms?.sidebarTitle || cms?.sidebarContent) ? "1fr 300px" : "1fr", gap: 64 }}>
                            <div>
                                <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, marginBottom: 8 }}>
                                    {cms?.title || "Artists"}
                                </h1>
                                <p className="text-muted" style={{ marginBottom: 64 }}>
                                    {cms?.description || "Artists represented and exhibited by NOD FLOW"}
                                </p>

                                {artists.length === 0 ? (
                                    <p style={{ fontStyle: "italic", color: "var(--grey-600)", padding: "80px 0" }}>
                                        Artist roster coming soon.
                                    </p>
                                ) : (
                                    <div className={`artist-grid ${(cms?.sidebarTitle || cms?.sidebarContent) ? "artist-grid--with-sidebar" : ""}`}>
                                        {artists.map((a: any) => (
                                            <Link href={`/artists/${a.slug}`} key={a._id.toString()} className="artist-card">
                                                <div style={{ position: "relative", height: "100%", minHeight: 400 }}>
                                                    <Image
                                                        src={a.profileImage?.url || a.photo || FALLBACK}
                                                        alt={a.name}
                                                        className="artist-card__img"
                                                        fill
                                                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        placeholder={a.profileImage?.blurDataURL ? "blur" : "empty"}
                                                        blurDataURL={a.profileImage?.blurDataURL}
                                                        style={{ objectFit: "cover", objectPosition: "center top" }}
                                                    />
                                                </div>
                                                <div className="artist-card__overlay">
                                                    <div className="artist-card__name">{a.name}</div>
                                                    <div className="artist-card__bio">{a.bio || "Exhibiting Artist"}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {(cms?.sidebarTitle || cms?.sidebarContent) && (
                                <aside style={{ borderLeft: "1px solid var(--grey-100)", paddingLeft: 40 }}>
                                    {cms.sidebarTitle && <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", marginBottom: 16 }}>{cms.sidebarTitle}</h3>}
                                    {cms.sidebarContent && <div style={{ fontSize: "0.9rem", color: "var(--grey-600)", lineHeight: 1.6 }}>{cms.sidebarContent}</div>}
                                </aside>
                            )}
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
