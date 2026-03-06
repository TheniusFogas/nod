import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = (process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY)?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    const diagnostic = {
        cloudName: {
            value: cloudName,
            length: cloudName?.length || 0
        },
        apiKey: {
            value: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "MISSING",
            length: apiKey?.length || 0
        },
        apiSecret: {
            exists: !!apiSecret,
            length: apiSecret?.length || 0,
            preview: apiSecret ? `${apiSecret.substring(0, 3)}...${apiSecret.substring(apiSecret.length - 3)}` : "MISSING"
        }
    };

    console.log("--- CLOUDINARY DIAGNOSTIC ---");
    console.log(JSON.stringify(diagnostic, null, 2));

    return NextResponse.json(diagnostic);
}
