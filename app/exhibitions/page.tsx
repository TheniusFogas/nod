import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/db";
import Exhibition from "@/models/Exhibition";
import PageContent from "@/models/PageContent";

import type { Metadata } from "next";

// Enable Incremental Static Regeneration (1 hr lifecycle mapping)
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
    await dbConnect();
    const cms = await PageContent.findOne({ slug: "exhibitions" }).lean() as any;
    const title = cms?.seoTitle || "Exhibitions | NOD FLOW";
    const description = cms?.seoDescription || cms?.description?.slice(0, 160) || "Explore current and upcoming exhibitions at NOD FLOW.";
    const ogImage = cms?.ogImage || "https://nodflo.com/og-default.jpg";

    return {
        title,
        description,
        openGraph: { title, description, images: [ogImage] }
    };
}

function formatDate(d: string) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const FALLBACK = "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=900&q=80";
const TYPES = ["all", "current", "upcoming", "past"];

export default async function ExhibitionsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
    await dbConnect();
    const { type } = await searchParams;
    const filter = type || "all";

    const exhibitions = await Exhibition.find(
        filter === "all" ? {} : { type: filter }
    ).sort({ startDate: -1 }).lean();

    const cms = await PageContent.findOne({ slug: "exhibitions" }).lean() as any;

    return (
        <>
            <Nav />
            <div style={{ paddingTop: "var(--nav-h)" }}>
                <section className="section">
                    <div className="container">
                        <div style={{ marginBottom: 48 }}>
                            <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, marginBottom: 8 }}>
                                {cms?.title || "Exhibitions"}
                            </h1>
                            {cms?.description && <p className="text-muted">{cms.description}</p>}
                        </div>

                        {/* Filters */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 56 }}>
                            {TYPES.map((t) => (
                                <Link
                                    key={t}
                                    href={`/exhibitions${t === "all" ? "" : `?type=${t}`}`}
                                    style={{
                                        padding: "8px 20px",
                                        border: "1px solid",
                                        borderColor: filter === t ? "var(--black)" : "rgba(0,0,0,0.15)",
                                        background: filter === t ? "var(--black)" : "transparent",
                                        color: filter === t ? "var(--white)" : "var(--black)",
                                        fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "capitalize",
                                        textDecoration: "none",
                                        cursor: "pointer", transition: "all 0.3s",
                                    }}
                                >
                                    {t}
                                </Link>
                            ))}
                        </div>

                        {exhibitions.length === 0 ? (
                            <p className="text-muted" style={{ fontStyle: "italic", padding: "80px 0" }}>
                                No exhibitions in this category yet.
                            </p>
                        ) : (
                            <div className="exhibition-grid">
                                {exhibitions.map((ex: any) => (
                                    <Link href={`/exhibitions/${ex.slug}`} key={ex._id.toString()} className="exhibition-card">
                                        <div className="exhibition-card__img-wrap">
                                            <img src={ex.coverImage || FALLBACK} alt={ex.title} className="exhibition-card__img" />
                                        </div>
                                        <div className="exhibition-card__tag">
                                            {ex.type === "current" ? "On View" : ex.type === "upcoming" ? "Upcoming" : "Past"}
                                        </div>
                                        <div className="exhibition-card__title">{ex.title}</div>
                                        <div className="exhibition-card__artist">{ex.artist}</div>
                                        <div className="exhibition-card__dates">
                                            {formatDate(ex.startDate)} — {formatDate(ex.endDate)}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
