const mongoose = require("mongoose");
const play = require("play-dl");
require("dotenv").config({ path: ".env" });

const Category = require("./models/category.model");
const MovieSeries = require("./models/movieSeries.model");
const ShortVideo = require("./models/shortVideo.model");

async function autoImport({ queryOrUrl, categoryName = "Drama", limit = 10 }) {
  const uri = process.env.MongoDb_Connection_String || "mongodb://127.0.0.1:27017/storybox";
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(uri);

  let seriesTitle = "";
  let seriesDesc = "";
  let bannerUrl = "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800";
  let thumbUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500";
  let videos = [];

  const isPlaylist = queryOrUrl.includes("list=") || queryOrUrl.includes("playlist");

  if (isPlaylist) {
    console.log(`🔍 Fetching playlist info: ${queryOrUrl} ...`);
    try {
      const playlist = await play.playlist_info(queryOrUrl, { incomplete: true });
      seriesTitle = playlist.title || "Imported Web Series";
      seriesDesc = playlist.description || `Auto-imported drama series with ${playlist.videos.length} episodes.`;
      bannerUrl = (playlist.thumbnail && playlist.thumbnail.url) || bannerUrl;
      thumbUrl = (playlist.videos[0]?.thumbnails[0]?.url) || bannerUrl;
      videos = playlist.videos;
    } catch (err) {
      console.error("❌ Failed to fetch playlist:", err.message);
      await mongoose.disconnect();
      return;
    }
  } else {
    console.log(`🔎 Searching YouTube for drama: "${queryOrUrl}" (Limit: ${limit}) ...`);
    seriesTitle = queryOrUrl;
    seriesDesc = `Top trending short drama episodes for "${queryOrUrl}".`;
    try {
      videos = await play.search(queryOrUrl, { limit: parseInt(limit, 10) || 10 });
    } catch (err) {
      console.error("❌ Search failed:", err.message);
      await mongoose.disconnect();
      return;
    }

    if (videos.length > 0) {
      const first = videos[0];
      thumbUrl = first.thumbnails?.[first.thumbnails.length - 1]?.url || thumbUrl;
      bannerUrl = thumbUrl;
    }
  }

  if (!videos || videos.length === 0) {
    console.log("⚠️ No videos found.");
    await mongoose.disconnect();
    return;
  }

  console.log(`\n📺 Series Name: "${seriesTitle}"`);
  console.log(`🎬 Total Episodes Found: ${videos.length}`);

  // Find or create Category
  let category = await Category.findOne({ name: new RegExp(`^${categoryName}$`, "i") });
  if (!category) {
    category = await Category.create({
      name: categoryName,
      uniqueId: `CAT-${categoryName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      isActive: true,
    });
    console.log(`📁 Created new category: "${categoryName}"`);
  } else {
    console.log(`📁 Assigned to category: "${category.name}"`);
  }

  // Create Web Series
  const movieSeries = await MovieSeries.create({
    category: category._id,
    name: seriesTitle,
    description: seriesDesc,
    banner: bannerUrl,
    thumbnail: thumbUrl,
    type: 2, // WebSeries
    maxAdsForFreeView: 2,
    releaseDate: new Date(),
    isTrending: true,
    isAutoAnimateBanner: true,
    isActive: true,
  });
  console.log(`✅ Created Series: "${movieSeries.name}" (ID: ${movieSeries._id})`);

  // Insert Episodes
  const episodes = videos.map((v, i) => {
    const isLocked = i >= 3;
    const epThumb = v.thumbnails && v.thumbnails.length > 0 ? v.thumbnails[v.thumbnails.length - 1].url : thumbUrl;
    return {
      movieSeries: movieSeries._id,
      episodeNumber: i,
      videoImage: epThumb,
      videoUrl: v.url || `https://www.youtube.com/watch?v=${v.id}`,
      duration: v.durationInSec || 60,
      coin: isLocked ? 20 : 0,
      isLocked: isLocked,
      releaseDate: new Date(),
    };
  });

  await ShortVideo.insertMany(episodes);
  console.log(`🎉 Successfully imported ${episodes.length} episodes into StoryBox!`);
  console.log(`   - Episode 0: Trailer (Free)`);
  console.log(`   - Episode 1-2: Free`);
  console.log(`   - Episode 3+: Locked (Coin required)`);

  await mongoose.disconnect();
  console.log("\n✨ Check your Admin Panel at: http://localhost:5001/filmList\n");
}

// CLI usage:
// node autoImportYoutube.js "Billionaire Romance Short Drama" "Romance" 8
// node autoImportYoutube.js "https://www.youtube.com/playlist?list=..." "Revenge"
const args = process.argv.slice(2);
if (args.length > 0) {
  const queryOrUrl = args[0];
  const categoryName = args[1] || "Drama";
  const limit = args[2] || 8;
  autoImport({ queryOrUrl, categoryName, limit }).catch((err) => {
    console.error("Import error:", err);
    process.exit(1);
  });
} else {
  module.exports = { autoImport };
}
