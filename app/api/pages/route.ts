import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import PageContent from "@/models/PageContent";

export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
        const page = await PageContent.findOne({ slug });
        return NextResponse.json(page || {});
    }

    const pages = await PageContent.find({}).sort({ slug: 1 });
    return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const data = await req.json();
    const page = await PageContent.findOneAndUpdate(
        { slug: data.slug },
        data,
        { upsert: true, new: true }
    );
    return NextResponse.json(page);
}
