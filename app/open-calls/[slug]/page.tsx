import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/db";
import { OpenCall } from "@/models/OpenCall";
import { notFound } from "next/navigation";
import OpenCallClient from "@/components/OpenCallClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    await dbConnect();
    const { slug } = await params;
    const call = await OpenCall.findOne({ slug }).lean() as any;

    if (!call) return { title: "Open Call Not Found | NOD FLOW" };

    const title = call.seoTitle || `${call.title} | Open Call | NOD FLOW`;
    const description = call.seoDescription || call.description?.slice(0, 160) || "Join the NOD FLOW community. Apply for this open call.";
    const ogImage = call.ogImage || call.coverImage || "https://nodflo.com/og-default.jpg";

    return {
        title,
        description,
        openGraph: { title, description, images: [ogImage] }
    };
}

export default async function OpenCallDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    await dbConnect();
    const { slug } = await params;
    const call = await OpenCall.findOne({ slug }).lean() as any;

    if (!call) {
        return notFound();
    }

    return (
        <>
            <Nav />
            <div style={{ paddingTop: "var(--nav-h)" }}>
                <section className="section">
                    <div className="container">
                        <OpenCallClient call={JSON.parse(JSON.stringify(call))} />
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
