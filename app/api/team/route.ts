export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import TeamMember from "@/models/TeamMember";

export async function GET() {
    await dbConnect();
    const team = await TeamMember.find({}).sort({ order: 1 });
    return NextResponse.json(team);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const data = await req.json();
    const member = await TeamMember.create(data);
    return NextResponse.json(member, { status: 201 });
}
