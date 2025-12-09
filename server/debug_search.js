
const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/Sources/LMSNodeJS/server/.env' });
const modelPost = require('d:/Sources/LMSNodeJS/server/src/models/post.model');

async function checkSearch() {
    try {
        await mongoose.connect(process.env.CONNECT_DB);
        console.log("Connected to DB");

        const keyword = "trọ hà nội";
        console.log(`Searching for: "${keyword}"`);

        // Split keyword logic (Implemented in Server)
        const words = keyword.split(' ').filter(w => w.trim());
        const regexes = words.map(w => new RegExp(w, 'i'));

        const query = {
            $and: regexes.map(r => ({
                $or: [
                    { title: r },
                    { location: r },
                    { description: r }
                ]
            })),
            status: 'active'
        };

        const postsSplit = await modelPost.find(query).limit(5).select('title location');

        console.log("Matches by Split Keywords (All words present):", postsSplit.length);
        postsSplit.forEach(p => console.log(" -", p.title, "|", p.location));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkSearch();
