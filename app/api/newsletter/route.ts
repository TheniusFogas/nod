import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";

export async function POST(req: NextRequest) {
    await dbConnect();
    const { email, name, phone, role } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    try {
        const subscriber = await NewsletterSubscriber.findOneAndUpdate(
            { email },
            { email, name, phone, role, isActive: true },
            { upsert: true, new: true }
        );
        return NextResponse.json({ success: true, subscriber });
    } catch (err) {
        return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
    }
}

export async function GET() {
    const session = await (await import("next-auth")).getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const subscribers = await NewsletterSubscriber.find({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json(subscribers);
}
