import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;
function ensureConfigured() {
    if (isConfigured) return;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
        console.error("CRITICAL: Cloudinary environment variables are missing!", {
            CLOUDINARY_CLOUD_NAME: cloudName ? `EXISTS (len: ${cloudName.length})` : "MISSING",
            CLOUDINARY_API_KEY: apiKey ? `EXISTS (len: ${apiKey.length})` : "MISSING",
            CLOUDINARY_API_SECRET: apiSecret ? `EXISTS (len: ${apiSecret.length})` : "MISSING",
        });
    } else {
        console.log("Cloudinary Config Check:", {
            cloudNameLen: cloudName.length,
            apiKeyLen: apiKey.length,
            apiSecretLen: apiSecret.length,
            secretPreview: `${apiSecret.substring(0, 3)}...${apiSecret.substring(apiSecret.length - 3)}`
        });
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });
    console.log("Cloudinary: config() called with cloud_name:", cloudName || "EMPTY");
    isConfigured = true;
}

export async function uploadImage(
    fileBuffer: Buffer,
    folder: string = "nodflo"
): Promise<{ url: string; publicId: string; blurDataURL: string }> {
    ensureConfigured();
    return new Promise((resolve, reject) => {
        console.log(`Cloudinary: Starting stream upload to folder "${folder}"...`);
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    return reject(error);
                }
                if (!result) {
                    console.error("Cloudinary Upload Error: No result object returned");
                    return reject(new Error("Cloudinary upload failed: No result"));
                }
                console.log("Cloudinary Upload Success:", result.secure_url);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    // Senior Architecture restriction: Generate instant LCP BlurHash via Cloudinary Edge Transformation
                    blurDataURL: result.secure_url.replace('/upload/', '/upload/w_10,e_blur:1000,f_auto,q_auto/')
                });
            }
        );

        uploadStream.on("error", (err) => {
            console.error("Cloudinary Stream Error:", err);
            reject(err);
        });

        uploadStream.end(fileBuffer);
    });
}

export default cloudinary;
