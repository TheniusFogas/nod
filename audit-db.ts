import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Manual env loading for absolute reliability
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = Object.fromEntries(
        envContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .map(line => {
                const parts = line.split('=');
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1');
                return [key, value];
            })
    );
    process.env.MONGODB_URI = envVars.MONGODB_URI;
} catch (e) {
    console.error('Failed to load .env.local:', e.message);
}

import dbConnect from './lib/db';
import { Exhibition } from './models/Exhibition';
import { Artist } from './models/Artist';

async function audit() {
    try {
        console.log('--- STARTING DATABASE AUDIT ---');
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not found in env');

        await dbConnect();
        console.log('✅ Connected to MongoDB');

        // 1. Audit Exhibition Document
        const ex = await Exhibition.findOne({}).select('-__v').lean();
        if (ex) {
            const json = JSON.stringify(ex);
            const size = Buffer.byteLength(json);
            console.log(`[Exhibition] Sample Slug: ${ex.slug}`);
            console.log(`[Exhibition] Document Size: ${(size / 1024).toFixed(2)} KB`);
            console.log(`[Exhibition] Keys: ${Object.keys(ex).length}`);
            if (size > 51200) {
                console.warn('⚠️ WARNING: Exhibition document exceeds 50KB!');
            }
        }

        // 2. Audit Artist Document
        const art = await Artist.findOne({}).select('-__v').lean();
        if (art) {
            const size = Buffer.byteLength(JSON.stringify(art));
            console.log(`[Artist] Sample Name: ${art.name}`);
            console.log(`[Artist] Document Size: ${(size / 1024).toFixed(2)} KB`);
        }

        // 3. Connection Health
        if (mongoose.connection.db) {
            const serverStatus = await mongoose.connection.db.admin().serverStatus();
            console.log(`[Mongo] Current Connections: ${serverStatus.connections.current}`);
            console.log(`[Mongo] Pool Size (Max): 10 (as configured in db.ts)`);
        }

        console.log('--- AUDIT COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Audit failed:', err);
        process.exit(1);
    }
}

audit();
