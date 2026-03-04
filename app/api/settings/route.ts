export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    await dbConnect();
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Default initial settings
            settings = await Settings.create({
                heroSlides: [
                    {
                        img: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1800&q=80",
                        eyebrow: "Currently on View",
                        title: "NOD FLOW Gallery",
                        subtitle: "Contemporary art in dialogue",
                    },
                    {
                        img: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1800&q=80",
                        eyebrow: "Open Exhibition",
                        title: "Space & Form",
                        subtitle: "A new perspective on abstraction",
                    }
                ]
            });
        }
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    try {
        const body = await req.json();
        const { _id, __v, ...data } = body;
        console.log("PUT /api/settings - User:", session.user?.email);
        console.log("PUT /api/settings - Payload keys:", Object.keys(data).join(", "));

        // Use findOneAndUpdate with upsert for absolute reliability
        const settings = await Settings.findOneAndUpdate({}, data, {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
        });

        if (!settings) throw new Error("Update returned null");
        console.log("PUT /api/settings - Update SUCCESS");
        return NextResponse.json(settings);
    } catch (error: any) {
        console.error("PUT /api/settings - ERROR:", error.message);
        return NextResponse.json({
            error: error.message || 'Failed to update settings',
            stack: error.stack,
            details: error.errors ? Object.keys(error.errors).map(k => error.errors[k].message) : []
        }, { status: 500 });
    }
}
