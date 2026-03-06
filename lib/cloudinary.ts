import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;
function ensureConfigured() {
    if (isConfigured) return;
    const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dsy11x1je")?.trim();
    const apiKey = (process.env.CLOUDINARY_API_KEY || "257811981813534")?.trim();
    const apiSecret = (process.env.CLOUDINARY_API_SECRET || "vM0ld1fAOudMmfs-BSlB6arekHk")?.trim();

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
    });
    isConfigured = true;
}

export async function uploadImage(
    fileBuffer: Buffer,
    folder: string = "nodflo"
): Promise<{ url: string; publicId: string; blurDataURL: string }> {
    ensureConfigured();

    const timestamp = Math.round(new Date().getTime() / 1000);

    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder,
            timestamp,
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    return reject(error);
                }
                if (!result) {
                    return reject(new Error("Cloudinary upload failed: No result"));
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    blurDataURL: result.secure_url.replace('/upload/', '/upload/w_10,e_blur:1000,f_auto,q_auto/')
                });
            }
        );

        uploadStream.on("error", (err) => {
            reject(err);
        });

        uploadStream.end(fileBuffer);
    });
}

export default cloudinary;
