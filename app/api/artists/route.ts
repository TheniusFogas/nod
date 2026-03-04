export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Artist from "@/models/Artist";

export async function GET() {
    await dbConnect();
    const artists = await Artist.find({}).sort({ name: 1 });
    return NextResponse.json(artists);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const data = await req.json();
    const artist = await Artist.create(data);
    return NextResponse.json(artist, { status: 201 });
}
