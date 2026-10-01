const mongoose = require('mongoose');

const BASE_URL = "http://192.168.29.168:5000/";

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/storybox');
  console.log('Connected to MongoDB');

  const db = mongoose.connection;
  
  // 1. Get Categories
  const categories = await db.collection('categories').find().toArray();
  const catMap = {};
  categories.forEach(c => {
    catMap[c.name.toLowerCase()] = c._id;
  });

  const romanceId = catMap['romance'] || categories[0]._id;
  const billionaireId = catMap['billionaire'] || categories[1]._id;
  const revengeId = catMap['revenge'] || categories[2]._id;
  const dramaId = catMap['drama'] || categories[3]._id;
  const suspenseId = catMap['suspense'] || categories[4]._id;

  // 2. Clear all previous dummy/placeholder data
  await db.collection('movieseries').deleteMany({});
  await db.collection('shortvideos').deleteMany({});
  console.log('Cleared all previous movieseries and shortvideos.');

  // 3. Define Real Original Web Series with FULL HTTP URLs
  const seriesData = [
    {
      name: "Silent Sacrifice: The Godfather's Hidden Child",
      description: "A gripping drama of loyalty, betrayal, and a powerful underworld figure protecting his hidden child against vicious rivals.",
      category: new mongoose.Types.ObjectId(suspenseId),
      banner: BASE_URL + "uploads/godfather_banner.jpg",
      thumbnail: BASE_URL + "uploads/godfather_thumb.jpg",
      type: 2, // Web Series
      view: 38450,
      share: 620,
      totalEpisodes: 4,
      isTrending: true,
      isActive: true,
      isAutoAnimateBanner: true,
      releaseDate: new Date(),
      episodes: [
        {
          episodeNumber: 1,
          videoUrl: BASE_URL + "uploads/godfather_ep1_compat.mp4",
          videoImage: BASE_URL + "uploads/godfather_thumb.jpg",
          duration: 60,
          coin: 0,
          isLocked: false
        },
        {
          episodeNumber: 2,
          videoUrl: BASE_URL + "uploads/godfather_ep2.mp4",
          videoImage: BASE_URL + "uploads/godfather_ep2_thumb.jpg",
          duration: 70,
          coin: 0,
          isLocked: false
        },
        {
          episodeNumber: 3,
          videoUrl: BASE_URL + "uploads/godfather_ep3.mp4",
          videoImage: BASE_URL + "uploads/godfather_ep3_thumb.jpg",
          duration: 70,
          coin: 0,
          isLocked: false
        },
        {
          episodeNumber: 4,
          videoUrl: BASE_URL + "uploads/godfather_ep4.mp4",
          videoImage: BASE_URL + "uploads/godfather_ep4_thumb.jpg",
          duration: 70,
          coin: 0,
          isLocked: false
        }
      ]
    },
    {
      name: "The Real Heiress Returns: Ruthless Revenge",
      description: "Cast aside by high society for a deceitful imposter, the true heiress returns in power and elegance to reclaim everything.",
      category: new mongoose.Types.ObjectId(revengeId),
      banner: BASE_URL + "uploads/fake_heiress_banner.jpg",
      thumbnail: BASE_URL + "uploads/fake_heiress_thumb.jpg",
      type: 2,
      view: 52100,
      share: 1350,
      totalEpisodes: 2,
      isTrending: true,
      isActive: true,
      isAutoAnimateBanner: true,
      releaseDate: new Date(),
      episodes: [
        {
          episodeNumber: 1,
          videoUrl: BASE_URL + "uploads/fake_heiress_ep1.mp4",
          videoImage: BASE_URL + "uploads/fake_heiress_thumb.jpg",
          duration: 65,
          coin: 0,
          isLocked: false
        },
        {
          episodeNumber: 2,
          videoUrl: BASE_URL + "uploads/fake_heiress_ep2.mp4",
          videoImage: BASE_URL + "uploads/fake_heiress_ep2_thumb.jpg",
          duration: 70,
          coin: 0,
          isLocked: false
        }
      ]
    }
  ];

  for (const s of seriesData) {
    const episodes = s.episodes;
    delete s.episodes;
    s.createdAt = new Date();
    s.updatedAt = new Date();

    const insertResult = await db.collection('movieseries').insertOne(s);
    const seriesId = insertResult.insertedId;
    console.log(`Created series: ${s.name} (ID: ${seriesId})`);

    for (const ep of episodes) {
      ep.movieSeries = new mongoose.Types.ObjectId(seriesId);
      ep.createdAt = new Date();
      ep.updatedAt = new Date();
      await db.collection('shortvideos').insertOne(ep);
    }
    console.log(`  -> Added ${episodes.length} original episodes with full URLs`);
  }

  console.log('\n--- SUCCESS: Database populated with full HTTP media URLs! ---');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
