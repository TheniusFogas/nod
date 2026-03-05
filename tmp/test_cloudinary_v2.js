const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Simple parser for .env files since dotenv is missing
function parseEnv(path) {
    const content = fs.readFileSync(path, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            env[match[1]] = value;
        }
    });
    return env;
}

const env = parseEnv('.env.production.local');

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary with extracted keys...');
console.log('Cloud Name:', env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', env.CLOUDINARY_API_KEY);
// Secret check: length and hash-like check
console.log('API Secret Length:', env.CLOUDINARY_API_SECRET ? env.CLOUDINARY_API_SECRET.length : 0);

cloudinary.api.ping((error, result) => {
    if (error) {
        console.error('Ping failed:', error);
        process.exit(1);
    } else {
        console.log('Ping successful:', result);
        cloudinary.api.usage((error, usage) => {
            if (error) {
                console.error('Usage check failed:', error);
                process.exit(1);
            } else {
                console.log('Usage check successful. Cloudinary is fully connected.');
                process.exit(0);
            }
        });
    }
});
