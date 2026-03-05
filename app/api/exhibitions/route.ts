export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Exhibition from "@/models/Exhibition";
import Artist from "@/models/Artist";
import { revalidatePath } from "next/cache";

function serializeDoc(doc: any) {
    if (!doc) return doc;
    const serialized = JSON.parse(JSON.stringify(doc));

    // Apply fallbacks for legacy artists to avoid undefined errors in UI
    if (Array.isArray(serialized.artists)) {
        serialized.artists = serialized.artists.map((a: any) => {
            if (typeof a.artist === 'object' && a.artist !== null) {
                a.artist.profileImage = a.artist.profileImage || { url: '', public_id: '', blurDataURL: '' };
                a.artist.socials = a.artist.socials || { instagram: '', website: '' };
            }
            return a;
        });
    }
    return serialized;
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");

        if (slug) {
            const exhibitionDoc = await Exhibition.findOne({ slug }).lean() as any;
            if (!exhibitionDoc) return NextResponse.json({ error: "Not found" }, { status: 404 });

            const artistIds = exhibitionDoc.artists?.map((a: any) => a.artist).filter(Boolean) || [];
            const populatedArtists = artistIds.length > 0 ? await Artist.find({ _id: { $in: artistIds } }).lean() : [];
            exhibitionDoc.artists = exhibitionDoc.artists?.map((a: any) => ({
                ...a,
                artist: populatedArtists.find((pa: any) => pa._id.toString() === a.artist?.toString()) || null
            }));

            return NextResponse.json(serializeDoc(exhibitionDoc));
        }

        const exhibitionsRaw = await Exhibition.find({}).sort({ startDate: -1 }).lean() as any[];

        // Collect all unique artist IDs requested across all exhibitions
        const allArtistIds = Array.from(new Set(
            exhibitionsRaw.flatMap(ex => ex.artists?.map((a: any) => a.artist?.toString())).filter(Boolean)
        ));
        const allPopulatedArtists = allArtistIds.length > 0 ? await Artist.find({ _id: { $in: allArtistIds } }).lean() : [];

        // Manually hydrate every exhibition
        const exhibitions = exhibitionsRaw.map(ex => {
            return {
                ...ex,
                artists: ex.artists?.map((a: any) => ({
                    ...a,
                    artist: allPopulatedArtists.find((pa: any) => pa._id.toString() === a.artist?.toString()) || null
                }))
            };
        });

        return NextResponse.json(exhibitions.map(serializeDoc));
    } catch (error: any) {
        console.error("Exhibition GET Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const data = await req.json();
        const exhibition = await Exhibition.create(data);

        revalidatePath("/exhibitions");
        revalidatePath("/");

        return NextResponse.json(serializeDoc(exhibition.toObject()), { status: 201 });
    } catch (error: any) {
        console.error("Exhibition POST Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
