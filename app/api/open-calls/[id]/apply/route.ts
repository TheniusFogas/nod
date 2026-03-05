import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { OpenCallApplication, OpenCall } from "@/models/OpenCall";
import ArtistContact from "@/models/ArtistContact";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await dbConnect();

    try {
        const formData = await req.formData();
        const call = await OpenCall.findById(id);

        if (!call || !call.isActive) {
            return NextResponse.json({ error: "This open call is not active" }, { status: 400 });
        }

        // Basic Info
        const artistName = formData.get("artistName") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const website = formData.get("website") as string;
        const videoLink = formData.get("videoLink") as string;
        const statement = formData.get("statement") as string;
        const agreeToContact = formData.get("agreeToContact") === "true";

        // Handle Images (up to 5)
        const imageFiles = formData.getAll("images") as File[];
        const uploadedImages = [];
        const { uploadImage } = await import("@/lib/cloudinary");

        for (const file of imageFiles.slice(0, 5)) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const result = await uploadImage(buffer, `nodflo/open-calls/${id}`);
            uploadedImages.push({ url: result.url, publicId: result.publicId });
        }

        // 1. Save Application
        const application = await OpenCallApplication.create({
            callId: id,
            callTitle: call.title,
            artistName,
            email,
            phone,
            website,
            videoLink,
            statement,
            images: uploadedImages,
            agreeToContact
        });

        // 2. Sync to Artist Database (Upsert)
        await ArtistContact.findOneAndUpdate(
            { email },
            {
                name: artistName,
                phone,
                website,
                consentToContact: agreeToContact,
                lastAppliedDate: new Date()
            },
            { upsert: true, new: true }
        );

        return NextResponse.json(application, { status: 201 });
    } catch (error: any) {
        console.error("Application error:", error);
        return NextResponse.json({ error: error.message || "Failed to submit application" }, { status: 500 });
    }
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await (await import("next-auth")).getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const applications = await OpenCallApplication.find({ callId: id }).sort({ createdAt: -1 });
    return NextResponse.json(applications);
}
