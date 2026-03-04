import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const folder = (formData.get("folder") as string) || "nodflo";

        // Diagnostic: Log all CLOUDINARY_* variable presence and lengths
        const cldKeys = Object.keys(process.env).filter(k => k.startsWith("CLOUDINARY_"));
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
        const apiKey = process.env.CLOUDINARY_API_KEY || "";
        const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

        console.log("API Upload Diagnostic:", {
            envsFound: cldKeys,
            cloudNameLen: cloudName.length,
            apiKeyLen: apiKey.length,
            apiSecretLen: apiSecret.length,
            secretPreview: `${apiSecret.substring(0, 3)}...${apiSecret.substring(apiSecret.length - 3)}`
        });

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        console.log(`API Upload: Processing file "${file.name}" (${file.size} bytes) for folder "${folder}"`);
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await uploadImage(buffer, folder);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("API Upload Exception:", error);
        return NextResponse.json({
            error: error.message || "Internal Server Error",
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        }, { status: 500 });
    }
}
