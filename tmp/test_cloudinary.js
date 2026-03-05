const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.production.local' });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.api.ping((error, result) => {
    if (error) {
        console.error('Ping failed:', error);
        process.exit(1);
    } else {
        console.log('Ping successful:', result);
        // Try to get account details
        cloudinary.api.usage((error, usage) => {
            if (error) {
                console.error('Usage check failed:', error);
                process.exit(1);
            } else {
                console.log('Usage check successful. Connection fully verified.');
                process.exit(0);
            }
        });
    }
});
