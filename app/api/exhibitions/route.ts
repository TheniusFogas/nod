export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Exhibition from "@/models/Exhibition";

export async function GET() {
    await dbConnect();
    const exhibitions = await Exhibition.find({}).sort({ createdAt: -1 });
    return NextResponse.json(exhibitions);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const data = await req.json();
    const exhibition = await Exhibition.create(data);
    return NextResponse.json(exhibition, { status: 201 });
}
