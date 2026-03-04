import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";

export async function POST(req: NextRequest) {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    await dbConnect();
    try {
        await NewsletterSubscriber.findOneAndUpdate(
            { email },
            { isActive: false }
        );
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Unsubscribe failed" }, { status: 500 });
    }
}
