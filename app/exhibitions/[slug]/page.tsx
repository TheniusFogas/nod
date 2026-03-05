import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/db";
import Exhibition from "@/models/Exhibition";
import Artist from "@/models/Artist";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    return { title: "Exhibition Detail | NOD FLOW" };
}

export default async function ExhibitionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    try {
        await dbConnect();
        const { slug } = await params;

        const exhibition = await Exhibition.findOne({ slug }).lean() as any;
        if (!exhibition) return notFound();

        return (
            <>
                <Nav dark />
                <div style={{ padding: "100px 20px" }}>
                    <h1>{exhibition.title}</h1>
                    <p>Minimal Render Mode active to find crash.</p>
                </div>
                <Footer />
            </>
        );
    } catch (e: any) {
        return (
            <div style={{ padding: 40 }}>
                <h1>Diagnostic Catch</h1>
                <pre>{e.message}</pre>
            </div>
        );
    }
}

