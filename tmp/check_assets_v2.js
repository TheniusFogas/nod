const mongoose = require('mongoose');
const fs = require('fs');

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

const env = parseEnv('.env.production.local');

async function check() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        // Eagerly Define schemas for scanning
        const ArtistSchema = new mongoose.Schema({}, { strict: false });
        const ExhibitionSchema = new mongoose.Schema({}, { strict: false });

        const Artist = mongoose.models.Artist || mongoose.model('Artist', ArtistSchema);
        const Exhibition = mongoose.models.Exhibition || mongoose.model('Exhibition', ExhibitionSchema);

        const cloudinaryArtists = await Artist.find({ 'profileImage.url': /cloudinary/i });
        const cloudinaryExhibitions = await Exhibition.find({ 'coverImage': /cloudinary/i });

        console.log(`Cloudinary Assets Found:`);
        console.log(`- Artists: ${cloudinaryArtists.length}`);
        console.log(`- Exhibitions: ${cloudinaryExhibitions.length}`);

        if (cloudinaryArtists.length > 0) {
            console.log('Sample Cloudinary URL (Artist):', cloudinaryArtists[0].profileImage.url);
        }
        if (cloudinaryExhibitions.length > 0) {
            console.log('Sample Cloudinary URL (Exhibition):', cloudinaryExhibitions[0].coverImage);
        }

        process.exit(0);
    } catch (err) {
        console.error('Operation failed:', err);
        process.exit(1);
    }
}

check();
