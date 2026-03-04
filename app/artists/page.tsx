import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/db";
import Artist from "@/models/Artist";
import PageContent from "@/models/PageContent";

const FALLBACK = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80";

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
    await dbConnect();
    const artists = await Artist.find({}).sort({ membership: 1, order: 1, name: 1 }).lean();
    const cms = await PageContent.findOne({ slug: "artists" }).lean() as any;

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
                                    <div className="artist-grid" style={{ gridTemplateColumns: (cms?.sidebarTitle || cms?.sidebarContent) ? "repeat(auto-fill, minmax(200px, 1fr))" : undefined }}>
                                        {artists.map((a: any) => (
                                            <Link href={`/artists/${a.slug}`} key={a._id.toString()} className="artist-card">
                                                <div className="artist-card__img-wrap">
                                                    <img src={a.photo || FALLBACK} alt={a.name} className="artist-card__img" />
                                                </div>
                                                <div className="artist-card__name">{a.name}</div>
                                                {a.nationality && <div className="artist-card__nationality">{a.nationality}</div>}
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
