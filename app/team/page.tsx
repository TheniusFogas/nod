import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/db";
import TeamMember from "@/models/TeamMember";
import PageContent from "@/models/PageContent";

const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    await dbConnect();
    const cms = await PageContent.findOne({ slug: "team" }).lean() as any;
    const title = cms?.seoTitle || "Team | NOD FLOW";
    const description = cms?.seoDescription || cms?.description?.slice(0, 160) || "The curators and coordinators behind NOD FLOW Gallery.";
    const ogImage = cms?.ogImage || "https://nodflo.com/og-default.jpg";

    return {
        title,
        description,
        openGraph: { title, description, images: [ogImage] }
    };
}

export default async function TeamPage() {
    await dbConnect();
    const team = await TeamMember.find({}).sort({ order: 1, name: 1 }).lean();
    const cms = await PageContent.findOne({ slug: "team" }).lean() as any;

    const ensureExternalLink = (url: string) => {
        if (!url) return "";
        return url.startsWith("http") ? url : `https://${url}`;
    };

    return (
        <>
            <Nav />
            <div style={{ paddingTop: "var(--nav-h)" }}>
                <section className="section">
                    <div className="container">
                        <div style={{ display: "grid", gridTemplateColumns: (cms?.sidebarTitle || cms?.sidebarContent) ? "1fr 300px" : "1fr", gap: 64 }}>
                            <div>
                                <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, marginBottom: 16 }}>
                                    {cms?.title || "Team"}
                                </h1>
                                <p style={{ color: "var(--grey-400)", maxWidth: 540, marginBottom: 80, lineHeight: 1.75 }}>
                                    {cms?.description || "The people behind NOD FLOW — curators, coordinators, and collaborators dedicated to creating meaningful encounters between art and public."}
                                </p>

                                {team.length === 0 ? (
                                    <p style={{ fontStyle: "italic", color: "var(--grey-600)", padding: "80px 0" }}>
                                        Team profiles coming soon.
                                    </p>
                                ) : (
                                    <div className="team-grid">
                                        {team.map((member: any) => (
                                            <div key={member._id.toString()} className="team-card">
                                                <div className="team-card__img-wrap">
                                                    <img src={member.photo || FALLBACK_PHOTO} alt={member.name} className="team-card__img" />
                                                </div>
                                                <div className="team-card__name">{member.name}</div>
                                                <div className="team-card__role">{member.role}</div>
                                                {member.bio && <p className="team-card__bio">{member.bio}</p>}
                                                {member.email && (
                                                    <a href={`mailto:${member.email}`} style={{ fontSize: "0.75rem", color: "var(--grey-600)", marginTop: 8, display: "block", textDecoration: "none" }}>
                                                        {member.email}
                                                    </a>
                                                )}
                                                {member.website && (
                                                    <a
                                                        href={ensureExternalLink(member.website)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ fontSize: "0.75rem", color: "var(--accent-dark)", marginTop: 4, display: "block", textDecoration: "none" }}
                                                    >
                                                        Visit Website ↗
                                                    </a>
                                                )}
                                            </div>
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
