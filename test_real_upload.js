const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Manually load .env.local
try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const lines = env.split('\n');
    lines.forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
            process.env[key] = value;
        }
    });
} catch (e) {
    console.error('Failed to read .env.local', e.message);
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('--- Cloudinary Credential Check ---');
console.log('Cloud Name:', cloudName);
console.log('API Key:', apiKey);
console.log('API Secret:', apiSecret ? 'PRESENT' : 'MISSING');

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
});

async function testUpload() {
    console.log('\n--- Starting Real Upload Test ---');
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "nodflo/content";

    // According to the error screenshot: 'folder=nodflo/content&timestamp=1772757260'
    const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    console.log('String To Sign (Calculated):', `folder=${folder}&timestamp=${timestamp}`);

    try {
        // Create a dummy 1x1 pixel image buffer
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');

        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder, timestamp },
                (error, result) => {
                    if (error) {
                        console.error('\n[FAILED] Cloudinary Error:', error);
                        reject(error);
                    } else {
                        console.log('\n[SUCCESS] Upload Result:', result.secure_url);
                        resolve(result);
                    }
                }
            );
            stream.end(buffer);
        });
    } catch (err) {
        console.error('\n[SYSTEM ERROR]:', err);
    }
}

testUpload();
