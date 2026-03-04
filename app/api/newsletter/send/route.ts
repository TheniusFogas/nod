import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";
import { sendEmail, newsletterTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subject, body } = await req.json();
    if (!subject || !body) return NextResponse.json({ error: "Subject and body required" }, { status: 400 });

    await dbConnect();
    const subscribers = await NewsletterSubscriber.find({ isActive: true });

    if (subscribers.length === 0) return NextResponse.json({ error: "No subscribers" }, { status: 400 });

    let sentCount = 0;
    try {
        for (const s of subscribers) {
            const personalizedBody = body.replace(/{nume}/g, s.name || "prietene");
            await sendEmail({
                to: s.email,
                subject,
                html: newsletterTemplate({ subject, body: personalizedBody, email: s.email }),
            });
            sentCount++;
        }
        return NextResponse.json({ success: true, sent: sentCount });
    } catch (err) {
        console.error("Email send error:", err);
        return NextResponse.json({ error: "Email failed to send", sentCount }, { status: 500 });
    }
}
