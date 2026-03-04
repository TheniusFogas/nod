export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import News from "@/models/News";

export async function GET() {
    await dbConnect();
    const news = await News.find({}).sort({ date: -1 });
    return NextResponse.json(news);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const data = await req.json();
    const newsItem = await News.create(data);
    return NextResponse.json(newsItem, { status: 201 });
}
