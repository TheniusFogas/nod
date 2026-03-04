export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Sponsor from "@/models/Sponsor";

export async function GET() {
    await dbConnect();
    const sponsors = await Sponsor.find({}).sort({ tier: 1, order: 1 });
    return NextResponse.json(sponsors);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const data = await req.json();
    const sponsor = await Sponsor.create(data);
    return NextResponse.json(sponsor, { status: 201 });
}
