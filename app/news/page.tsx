import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/db";
import News from "@/models/News";
import PageContent from "@/models/PageContent";
import type { Metadata } from "next";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
    await dbConnect();
    const cms = await PageContent.findOne({ slug: "news" }).lean() as any;
    const title = cms?.seoTitle || "News & Press | NOD FLOW";
    const description = cms?.seoDescription || cms?.description?.slice(0, 160) || "Latest news, press releases, and media coverage for NOD FLOW Gallery.";
    const ogImage = cms?.ogImage || "https://nodflo.com/og-default.jpg";

    return {
        title,
        description,
        openGraph: { title, description, images: [ogImage] }
    };
}


export default async function NewsPage() {
    await dbConnect();
    const news = await News.find({}).select('title link image source date excerpt content -__v -updatedAt').sort({ date: -1 }).lean();
    const cms = await PageContent.findOne({ slug: "news" }).select('title description seoTitle seoDescription ogImage -__v -updatedAt').lean() as any;

    return (
        <>
            <Nav />
            <div style={{ paddingTop: "var(--nav-h)" }}>
                <section className="section">
                    <div className="container">
                        <div style={{ marginBottom: 64 }}>
                            <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, marginBottom: 8 }}>
                                {cms?.title || "News & Press"}
                            </h1>
                            {cms?.description && <p className="text-muted">{cms.description}</p>}
                        </div>

                        {news.length === 0 ? (
                            <p style={{ fontStyle: "italic", color: "var(--grey-600)", padding: "80px 0" }}>
                                News coming soon.
                            </p>
                        ) : (
                            <div className="news-grid">
                                {news.map((item: any) => (
                                    <Link
                                        key={item._id.toString()}
                                        href={item.link || (item.content ? `/news/${item._id}` : "#")}
                                        target={item.link ? "_blank" : "_self"}
                                        rel={item.link ? "noopener noreferrer" : ""}
                                        className="news-card"
                                        style={{ textDecoration: "none" }}
                                    >
                                        {item.image ? (
                                            <div className="news-card__img-wrap" style={{ position: 'relative', height: 200 }}>
                                                <Image
                                                    src={item.image}
                                                    alt={item.title || "News Image"}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                    style={{ objectFit: 'cover' }}
                                                    className="news-card__img"
                                                />
                                            </div>
                                        ) : (
                                            <div className="news-card__img-wrap" style={{ height: 200, background: 'var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--grey-400)' }}>
                                                No Image
                                            </div>
                                        )}
                                        <div className="news-card__source">{item.source}</div>
                                        <div className="news-card__title">{item.title}</div>
                                        {item.excerpt && (
                                            <p style={{ fontSize: "0.85rem", color: "var(--grey-400)", marginTop: 8, lineHeight: 1.7 }}>
                                                {item.excerpt}
                                            </p>
                                        )}
                                        <div className="news-card__date" style={{ marginTop: 12 }}>{formatDate(item.date)}</div>
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
