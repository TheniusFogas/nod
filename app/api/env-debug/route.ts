import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
    const authHeader = req.headers.get("x-debug-secret");
    if (authHeader !== "nodflo-debug-2026") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
    const apiKey = process.env.CLOUDINARY_API_KEY || "";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

    return NextResponse.json({
        cloudName: {
            length: cloudName.length,
            trimmedLength: cloudName.trim().length,
            preview: cloudName.trim().substring(0, 3) + "..." + cloudName.trim().slice(-3)
        },
        apiKey: {
            length: apiKey.length,
            trimmedLength: apiKey.trim().length,
            preview: apiKey.trim().substring(0, 3) + "..." + apiKey.trim().slice(-3)
        },
        apiSecret: {
            length: apiSecret.length,
            trimmedLength: apiSecret.trim().length,
            preview: apiSecret.trim().substring(0, 3) + "..." + apiSecret.trim().slice(-3)
        }
    });
}
