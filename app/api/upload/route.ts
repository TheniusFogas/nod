import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "nodflo";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer, folder);
    return NextResponse.json(result);
}
