import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://artgrup_db_user:TsJDgFDMjRxU98rI@cluster0.vm3qgem.mongodb.net/?appName=Cluster0"

async function debug() {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    if (!db) {
        console.error("No database connection");
        process.exit(1);
    }
    const exhibitions = await db.collection("exhibitions").find({}).toArray();
    console.log("Total exhibitions:", exhibitions.length);
    exhibitions.forEach(ex => {
        console.log("---");
        console.log("Title:", ex.title);
        console.log("Slug:", ex.slug);
        console.log("Artists Count:", ex.artists?.length);
        console.log("Description:", !!ex.description);
        console.log("StartDate:", ex.startDate);
        console.log("EndDate:", ex.endDate);
    });
    process.exit(0);
}

debug();
