import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;
function ensureConfigured() {
    if (isConfigured) return;
    const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)?.trim();
    const apiKey = (process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY)?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
        console.error("Cloudinary Error: Missing environment variables", { cloudName, apiKey, hasSecret: !!apiSecret });
    }

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

    // Explicitly generate signature if needed, but Cloudinary SDK handles it if we pass correct options
    // The key is that 'folder' MUST be part of the signature calculation if we use it.

    return new Promise((resolve, reject) => {
        const uploadOptions: any = {
            folder,
            timestamp,
        };

        // If we want to be 100% sure about the signature, we can manually sign it
        // but typically cloudinary.config() handles it. 
        // Let's verify what's happening.

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    // Log the error details to help debug signature issues
                    if ((error as any).http_code === 401) {
                        console.error("Auth Failure Details:", (error as any).message);
                    }
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
