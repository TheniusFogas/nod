export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Exhibition from "@/models/Exhibition";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");

        if (slug) {
            const exhibition = await Exhibition.findOne({ slug }).populate("artists.artist").lean();
            return exhibition ? NextResponse.json(exhibition) : NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const exhibitions = await Exhibition.find({}).sort({ startDate: -1 }).populate("artists.artist").lean();
        return NextResponse.json(exhibitions);
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
        return NextResponse.json(exhibition, { status: 201 });
    } catch (error: any) {
        console.error("Exhibition POST Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
