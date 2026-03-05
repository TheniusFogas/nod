const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.production.local' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Artist = mongoose.models.Artist || mongoose.model('Artist', new mongoose.Schema({}, { strict: false }));
        const Exhibition = mongoose.models.Exhibition || mongoose.model('Exhibition', new mongoose.Schema({}, { strict: false }));

        const cloudinaryArtists = await Artist.find({ 'profileImage.url': /cloudinary/i });
        const cloudinaryExhibitions = await Exhibition.find({ 'coverImage': /cloudinary/i });

        console.log(`Cloudinary Artists found: ${cloudinaryArtists.length}`);
        console.log(`Cloudinary Exhibitions found: ${cloudinaryExhibitions.length}`);

        if (cloudinaryArtists.length > 0) {
            console.log('Sample Cloudinary URL:', cloudinaryArtists[0].profileImage.url);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
