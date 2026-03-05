const mongoose = require('mongoose');
const uri = 'mongodb+srv://admin:nodadmin123@cluster0.xy2i0.mongodb.net/nodflo?retryWrites=true&w=majority';

async function test() {
    try {
        await mongoose.connect(uri);
        const Exhibition = require('./models/Exhibition').default || require('./models/Exhibition');
        const Artist = require('./models/Artist').default || require('./models/Artist');

        const ex = await Exhibition.findOne({ slug: 'sperante-subiective' }).populate('artists.artist').lean();
        console.log("Raw artists payload:");
        console.log(JSON.stringify(ex.artists, null, 2));

        const cleanArtists = (ex.artists || []).filter((item) => item && item.artist);
        const uiArtists = cleanArtists.map((a) => ({
            name: a.artist.name,
            slug: a.artist.slug,
            manualName: a.manualName
        }));

        console.log("uiArtists payload:");
        console.log(JSON.stringify(uiArtists, null, 2));

    } catch (err) {
        console.error("Crash during mapping:", err);
    } finally {
        process.exit(0);
    }
}
test();
