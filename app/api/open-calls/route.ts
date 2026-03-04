export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { OpenCall } from "@/models/OpenCall";

export async function GET() {
    await dbConnect();
    const calls = await OpenCall.find({}).sort({ createdAt: -1 });
    return NextResponse.json(calls);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const data = await req.json();
    const call = await OpenCall.create(data);
    return NextResponse.json(call, { status: 201 });
}
