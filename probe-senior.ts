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

async function seniorAudit() {
    try {
        await dbConnect();
        console.log('--- SENIOR ARCHITECTURE PROBE ---');

        // 1. EXHIBITION BLOAT & PROJECTION PROBE
        const ex = await Exhibition.findOne({}).select('title slug startDate endDate coverImage').lean();
        if (ex) {
            const size = Buffer.byteLength(JSON.stringify(ex));
            console.log(`[PROBE: SIZE] Exhibition POJO Size: ${(size / 1024).toFixed(2)} KB`);
            console.log(`[PROBE: PROJECTION] Payload Keys: ${Object.keys(ex).join(', ')}`);
        }

        // 2. EXPLAIN PLAN PROBE (The Truth)
        if (mongoose.connection.db) {
            // Pick a real slug if possible or just use one
            const sampleSlug = (await Exhibition.findOne({}).select('slug').lean())?.slug;
            if (sampleSlug) {
                const collection = mongoose.connection.db.collection('exhibitions');
                const explain = await collection.find({ slug: sampleSlug }).explain("executionStats");

                const stats = explain.executionStats;
                console.log(`[PROBE: INDEX] Execution Plan for slug "${sampleSlug}":`);
                console.log(` - totalKeysExamined: ${stats.totalKeysExamined}`);
                console.log(` - totalDocsExamined: ${stats.totalDocsExamined}`);
                console.log(` - executionTimeMillis: ${stats.executionTimeMillis}ms`);

                if (stats.totalDocsExamined === 1 && stats.totalKeysExamined === 1) {
                    console.log(' ✅ INDEX EFFICIENCY: PERFECT (IXSCAN)');
                } else {
                    console.warn(' ⚠️ INDEX WARNING: Inefficient scan detected.');
                }
            }
        }

        console.log('--- PROBE COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Probe failed:', err);
        process.exit(1);
    }
}

seniorAudit();
