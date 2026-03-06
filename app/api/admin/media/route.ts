import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listMedia, deleteMedia } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const folder = req.nextUrl.searchParams.get("folder") || "nodflo/content";
        const resources = await listMedia(folder);
        return NextResponse.json(resources);
    } catch (error: any) {
        console.error("Media List Error:", error);
        return NextResponse.json({ error: error.message || "Failed to list media" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { publicId } = await req.json();
        if (!publicId) {
            return NextResponse.json({ error: "Public ID is required" }, { status: 400 });
        }

        await deleteMedia(publicId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Media Delete Error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete media" }, { status: 500 });
    }
}
