"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { formatDate } from "@/lib/utils";


export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/news/${params.id}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) router.push("/news");
                else setItem(data);
            })
            .catch(() => router.push("/news"))
            .finally(() => setLoading(false));
    }, [params.id, router]);

    if (loading) return (
        <><Nav /><div style={{ paddingTop: "var(--nav-h)", textAlign: "center", padding: 100 }}>Loading...</div><Footer /></>
    );

    if (!item) return null;

    return (
        <>
            <Nav />
            <div style={{ paddingTop: "var(--nav-h)" }}>
                <section className="section">
                    <div className="container" style={{ maxWidth: 800 }}>
                        <div style={{ marginBottom: 48 }}>
                            <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--grey-400)", marginBottom: 12 }}>
                                {item.source} • {formatDate(item.date)}
                            </div>
                            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "3rem", fontWeight: 400, lineHeight: 1.2, marginBottom: 32 }}>
                                {item.title}
                            </h1>
                            {item.excerpt && (
                                <p style={{ fontSize: "1.2rem", lineHeight: 1.6, color: "var(--grey-600)", borderLeft: "2px solid var(--accent-dark)", paddingLeft: 24, margin: "40px 0" }}>
                                    {item.excerpt}
                                </p>
                            )}
                        </div>

                        {item.image && (
                            <div style={{ marginBottom: 64 }}>
                                <img src={item.image} alt={item.title} style={{ width: "100%", height: "auto", borderRadius: 2 }} />
                            </div>
                        )}

                        <div
                            className="rich-text"
                            style={{ lineHeight: 1.9, fontSize: "1.05rem", color: "var(--grey-600)" }}
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        />

                        <div style={{ marginTop: 80, paddingTop: 40, borderTop: "1px solid var(--grey-100)" }}>
                            <button onClick={() => router.back()} className="btn btn--outline">← Back to News</button>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
