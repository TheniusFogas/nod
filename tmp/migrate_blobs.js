const mongoose = require('mongoose');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

function parseEnv(path) {
    if (!fs.existsSync(path)) return {};
    const content = fs.readFileSync(path, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            env[match[1]] = value.trim();
        }
    });
    return env;
}

const env1 = parseEnv('.env.production.local');
const env2 = parseEnv('.env.local');
const env = { ...env1, ...env2 };

cloudinary.config({
    cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
});

async function uploadToCloudinary(url) {
    if (!url.includes('.blob.vercel-storage.com')) return url;
    console.log(`[Migrating] ${url.substring(0, 50)}...`);
    try {
        const result = await cloudinary.uploader.upload(url, { folder: "nodflo/migrated" });
        return result.secure_url;
    } catch (err) {
        console.error("[FAILED]", url, err);
        return url;
    }
}

async function processObject(obj, modified = { flag: false }) {
    if (!obj) return obj;
    if (typeof obj === 'string') {
        if (obj.includes('.blob.vercel-storage.com')) {
            modified.flag = true;
            return await uploadToCloudinary(obj);
        }
        return obj;
    }
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            obj[i] = await processObject(obj[i], modified);
        }
        return obj;
    }
    if (typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
            // Check if property is manageable and not DB specific
            if (key === '_id' || key === 'createdAt' || key === 'updatedAt' || key === '__v') continue;
            obj[key] = await processObject(obj[key], modified);
        }
    }
    return obj;
}

async function migrate() {
    console.log("Connecting to Database...");
    await mongoose.connect(env.MONGODB_URI);
    console.log("Testing Cloudinary Credentials...");

    try {
        const ping = await cloudinary.api.ping();
        console.log("Cloudinary Authenticated:", ping.status);
    } catch (e) {
        console.error("Cloudinary Auth Failed:", e);
        process.exit(1);
    }

    const collections = ['artists', 'exhibitions', 'news', 'settings', 'sponsors', 'teammembers', 'pagecontents', 'opencalls'];

    let totalUpdated = 0;

    for (const collName of collections) {
        const Model = mongoose.models[collName] || mongoose.model(collName, new mongoose.Schema({}, { collection: collName, strict: false }));
        const docs = await Model.find({});
        console.log(`Scanning ${collName} (${docs.length} docs)`);

        for (const doc of docs) {
            const data = doc.toObject();
            let modified = { flag: false };
            const newData = await processObject(data, modified);
            if (modified.flag) {
                delete newData._id;
                await Model.updateOne({ _id: doc._id }, { $set: newData });
                console.log(`>> ✔️ Updated document ${doc._id} in ${collName}`);
                totalUpdated++;
            }
        }
    }
    console.log(`Migration complete. Updated ${totalUpdated} docs.`);
    process.exit(0);
}

migrate();
