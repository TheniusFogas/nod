"use client";

export default function cloudinaryLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    // If it's not a Cloudinary URL, return as is
    if (!src.includes("res.cloudinary.com")) return src;

    // Senior Architecture: Shifting computation to Cloudinary Edge
    // Automates: f_auto (WebP/AVIF), q_auto (Intelligent compression), and responsive resizing
    const params = [
        "f_auto",
        "q_auto",
        `w_${width}`,
        quality ? `q_${quality}` : ""
    ].filter(Boolean).join(",");

    return src.replace("/upload/", `/upload/${params}/`);
}
