const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const Category = require("./models/category.model");
const MovieSeries = require("./models/movieSeries.model");
const ShortVideo = require("./models/shortVideo.model");

const LOCAL_VIDEO = "http://192.168.29.168:5000/uploads/sample_episode.mp4";

const VIDEO_URLS = [
  LOCAL_VIDEO,
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  LOCAL_VIDEO,
  "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
];

const EP_THUMBNAILS = [
  "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=70",
  "https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?w=400&q=70",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&q=70",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=70",
  "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&q=70",
  "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=400&q=70",
  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&q=70",
  "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400&q=70",
];

const DRAMA_SERIES = [
  {
    category: "Billionaire",
    name: "The Billionaire's Hidden Wife",
    description: "A contract marriage turns real when a cold CEO discovers his arranged bride is the girl he once saved. Now he must choose between his empire and his heart.",
    banner: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=900&q=80",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    episodes: 15,
    freeEpisodes: 3,
  },
  {
    category: "Billionaire",
    name: "Marry My Ruthless Boss",
    description: "She accidentally spilled coffee on the most powerful man in the city. Now she owes him and he demands she become his pretend fiance.",
    banner: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&q=80",
    thumbnail: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    episodes: 20,
    freeEpisodes: 3,
  },
  {
    category: "Romance",
    name: "Love At First Sight CEO",
    description: "When a small-town girl becomes the personal assistant to a mysterious tech CEO, she discovers secrets that will change both their lives forever.",
    banner: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80",
    thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80",
    episodes: 18,
    freeEpisodes: 3,
  },
  {
    category: "Romance",
    name: "Second Chance at Love",
    description: "They were college sweethearts until fate tore them apart. Ten years later, destiny brings them together again but old wounds run deep.",
    banner: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=900&q=80",
    thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    episodes: 12,
    freeEpisodes: 3,
  },
  {
    category: "Revenge",
    name: "Rise of the Fallen Princess",
    description: "Betrayed by her own family and left for dead, she returns five years later as the most powerful woman in the country and vengeance is her only goal.",
    banner: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&q=80",
    thumbnail: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80",
    episodes: 25,
    freeEpisodes: 3,
  },
  {
    category: "Revenge",
    name: "The CEO's Calculated Revenge",
    description: "Once the most innocent man alive, he was framed and imprisoned. Now free and powerful, he returns to destroy everyone who betrayed him one by one.",
    banner: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80",
    thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    episodes: 22,
    freeEpisodes: 3,
  },
  {
    category: "Drama",
    name: "Her Secret Heir",
    description: "A single mother discovers her son is heir to a billion-dollar empire. But claiming his birthright means facing the cold-hearted grandfather who wants them gone.",
    banner: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80",
    thumbnail: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80",
    episodes: 16,
    freeEpisodes: 3,
  },
  {
    category: "Drama",
    name: "The Hidden Truth",
    description: "A journalist uncovers a conspiracy that goes all the way to the top. Now she is in danger and the only person who can help her is the man she despises most.",
    banner: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=900&q=80",
    thumbnail: "https://images.unsplash.com/photo-1546961342-ea5f63d193cf?w=400&q=80",
    episodes: 14,
    freeEpisodes: 3,
  },
  {
    category: "Suspense",
    name: "The Masked Tycoon",
    description: "She married a stranger to save her family. He hid his identity to find a woman who would love him for who he is. But who is really deceiving whom?",
    banner: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=900&q=80",
    thumbnail: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    episodes: 19,
    freeEpisodes: 3,
  },
  {
    category: "Suspense",
    name: "Dangerous Temptation",
    description: "An undercover agent must get close to a crime boss without losing herself. But when feelings get real, everything she has worked for is at stake.",
    banner: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80",
    thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    episodes: 17,
    freeEpisodes: 3,
  },
  {
    category: "Fantasy",
    name: "Dragon King's Unwilling Queen",
    description: "She was chosen as sacrifice for the Dragon King but instead of devouring her, he makes her his queen. Now she must survive in a world of magic and political schemes.",
    banner: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=900&q=80",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    episodes: 30,
    freeEpisodes: 5,
  },
  {
    category: "Fantasy",
    name: "Reborn as the Villain's Wife",
    description: "She woke up inside her favorite novel as the villainess destined to die. To survive, she must change the story and somehow tame the powerful antagonist who is supposed to destroy her.",
    banner: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80",
    thumbnail: "https://images.unsplash.com/photo-1502767089025-6572583495f5?w=400&q=80",
    episodes: 28,
    freeEpisodes: 5,
  },
];

async function loadContent() {
  const uri = process.env.MongoDb_Connection_String || "mongodb://127.0.0.1:27017/storybox";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const allCats = await Category.find();
  const catMap = {};
  allCats.forEach((c) => { catMap[c.name] = c._id; });
  console.log("Categories found: " + allCats.map((c) => c.name).join(", "));

  let totalSeriesAdded = 0;
  let totalEpisodesAdded = 0;

  for (const series of DRAMA_SERIES) {
    const exists = await MovieSeries.findOne({ name: series.name });
    if (exists) {
      console.log("Skipping (already exists): " + series.name);
      continue;
    }

    let catId = catMap[series.category];
    if (!catId) {
      const newCat = await Category.create({
        name: series.category,
        uniqueId: "CAT-" + series.category.substring(0, 3).toUpperCase() + "-" + Date.now().toString().slice(-4),
        isActive: true,
      });
      catId = newCat._id;
      catMap[series.category] = catId;
      console.log("Created new category: " + series.category);
    }

    const movieSeries = await MovieSeries.create({
      category: catId,
      name: series.name,
      description: series.description,
      banner: series.banner,
      thumbnail: series.thumbnail,
      type: 2,
      maxAdsForFreeView: 3,
      releaseDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      isTrending: Math.random() > 0.4,
      isAutoAnimateBanner: true,
      isActive: true,
    });

    const episodes = [];
    for (let i = 0; i <= series.episodes; i++) {
      const isTrailer = i === 0;
      const isLocked = !isTrailer && i > series.freeEpisodes;
      const vidUrl = VIDEO_URLS[i % VIDEO_URLS.length];
      const epThumb = EP_THUMBNAILS[i % EP_THUMBNAILS.length];

      episodes.push({
        movieSeries: movieSeries._id,
        episodeNumber: i,
        videoImage: epThumb,
        videoUrl: vidUrl,
        duration: 180 + Math.floor(Math.random() * 120),
        coin: isLocked ? 20 : 0,
        isLocked: isLocked,
        releaseDate: new Date(Date.now() - (series.episodes - i) * 24 * 60 * 60 * 1000),
      });
    }

    await ShortVideo.insertMany(episodes);
    totalSeriesAdded++;
    totalEpisodesAdded += episodes.length;
    console.log("Added: " + series.name + " [" + series.category + "] — " + episodes.length + " episodes");
  }

  console.log("\n========================================");
  console.log("DONE! Added " + totalSeriesAdded + " series, " + totalEpisodesAdded + " episodes total.");
  console.log("========================================\n");

  const totalSeries = await MovieSeries.countDocuments();
  const totalEps = await ShortVideo.countDocuments();
  console.log("Database now has: " + totalSeries + " series | " + totalEps + " episodes");

  await mongoose.disconnect();
  process.exit(0);
}

loadContent().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
