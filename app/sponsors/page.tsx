import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/db";
import Sponsor from "@/models/Sponsor";
import PageContent from "@/models/PageContent";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    await dbConnect();
    const cms = await PageContent.findOne({ slug: "sponsors" }).lean() as any;
    const title = cms?.seoTitle || "Partners & Sponsors | NOD FLOW";
    const description = cms?.seoDescription || cms?.description?.slice(0, 160) || "Explore our partners and sponsors who support NOD FLOW Gallery.";
    const ogImage = cms?.ogImage || "https://nodflo.com/og-default.jpg";

    return {
        title,
        description,
        openGraph: { title, description, images: [ogImage] }
    };
}

export default async function SponsorsPage() {
    await dbConnect();
    const sponsors = await Sponsor.find({}).sort({ tier: 1, name: 1 }).lean();
    const cms = await PageContent.findOne({ slug: "sponsors" }).lean() as any;

    const tiers = {
        gold: sponsors.filter((s: any) => s.tier === 'gold'),
        silver: sponsors.filter((s: any) => s.tier === 'silver'),
        partner: sponsors.filter((s: any) => s.tier === 'partner')
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
                    {items.map((s: any) => (
                        <a key={s._id.toString()} href={s.website || "#"} target="_blank" rel="noopener noreferrer" className="sponsor-logo-link">
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
            <style jsx>{`
                .sponsor-logo-link {
                    opacity: 0.7;
                    transition: opacity 0.3s;
                }
                .sponsor-logo-link:hover {
                    opacity: 1;
                }
            `}</style>
        </>
    );
}
