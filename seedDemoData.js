const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const Category = require("./models/category.model");
const MovieSeries = require("./models/movieSeries.model");
const ShortVideo = require("./models/shortVideo.model");
const CoinPlan = require("./models/coinplan.model");
const VipPlan = require("./models/vipPlan.model");

async function seed() {
  const uri = process.env.MongoDb_Connection_String || "mongodb://127.0.0.1:27017/storybox";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB for demo data seeding...");

  // 1. Categories
  const existingCats = await Category.countDocuments();
  let romanceCat, billionaireCat, revengeCat;
  if (existingCats === 0) {
    const cats = await Category.insertMany([
      { name: "Romance", uniqueId: "CAT-ROM", isActive: true },
      { name: "Billionaire", uniqueId: "CAT-BIL", isActive: true },
      { name: "Revenge", uniqueId: "CAT-REV", isActive: true },
      { name: "Drama", uniqueId: "CAT-DRM", isActive: true },
      { name: "Suspense", uniqueId: "CAT-SUS", isActive: true },
      { name: "Fantasy", uniqueId: "CAT-FAN", isActive: true },
    ]);
    romanceCat = cats[0]._id;
    billionaireCat = cats[1]._id;
    revengeCat = cats[2]._id;
    console.log(`Seeded ${cats.length} Categories.`);
  } else {
    const all = await Category.find();
    romanceCat = all[0]._id;
    billionaireCat = all[1]?._id || all[0]._id;
    revengeCat = all[2]?._id || all[0]._id;
    console.log("Categories already exist.");
  }

  // 2. Movie/Series
  const existingSeries = await MovieSeries.countDocuments();
  if (existingSeries === 0) {
    const series1 = await MovieSeries.create({
      category: billionaireCat,
      name: "The Billionaire's Secret Bride",
      description: "A young woman accidentally signs a marriage contract with a powerful tech billionaire.",
      banner: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800",
      thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
      type: 2, // WebSeries
      maxAdsForFreeView: 3,
      isTrending: true,
      isAutoAnimateBanner: true,
      isActive: true,
    });

    const series2 = await MovieSeries.create({
      category: revengeCat,
      name: "Revenge of the Exiled CEO",
      description: "Betrayed and left with nothing, he returns after five years with unimaginable power.",
      banner: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
      type: 2,
      maxAdsForFreeView: 2,
      isTrending: true,
      isAutoAnimateBanner: true,
      isActive: true,
    });

    const series3 = await MovieSeries.create({
      category: romanceCat,
      name: "Love Under the Starlight",
      description: "Two aspiring musicians find harmony in a city full of heartbreak and dreams.",
      banner: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
      thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500",
      type: 2,
      maxAdsForFreeView: 2,
      isTrending: false,
      isAutoAnimateBanner: false,
      isActive: true,
    });

    // Sample video URL (public sample mp4)
    const sampleVideo = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

    // 3. Episodes for Series 1
    await ShortVideo.insertMany([
      {
        movieSeries: series1._id,
        episodeNumber: 0,
        videoImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
        videoUrl: sampleVideo,
        duration: 90,
        coin: 0,
        isLocked: false,
      },
      {
        movieSeries: series1._id,
        episodeNumber: 1,
        videoImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500",
        videoUrl: sampleVideo,
        duration: 120,
        coin: 0,
        isLocked: false,
      },
      {
        movieSeries: series1._id,
        episodeNumber: 2,
        videoImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500",
        videoUrl: sampleVideo,
        duration: 110,
        coin: 20,
        isLocked: true,
      },
      {
        movieSeries: series1._id,
        episodeNumber: 3,
        videoImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500",
        videoUrl: sampleVideo,
        duration: 130,
        coin: 25,
        isLocked: true,
      },
    ]);

    // Episodes for Series 2
    await ShortVideo.insertMany([
      {
        movieSeries: series2._id,
        episodeNumber: 0,
        videoImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
        videoUrl: sampleVideo,
        duration: 85,
        coin: 0,
        isLocked: false,
      },
      {
        movieSeries: series2._id,
        episodeNumber: 1,
        videoImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500",
        videoUrl: sampleVideo,
        duration: 115,
        coin: 0,
        isLocked: false,
      },
      {
        movieSeries: series2._id,
        episodeNumber: 2,
        videoImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500",
        videoUrl: sampleVideo,
        duration: 105,
        coin: 20,
        isLocked: true,
      },
    ]);

    console.log("Seeded 3 Web Series with Episodes.");
  }

  // 4. Coin Plans
  const existingCoinPlans = await CoinPlan.countDocuments();
  if (existingCoinPlans === 0) {
    await CoinPlan.insertMany([
      { icon: "", coin: 100, bonusCoin: 20, price: 1.99, offerPrice: 0.99, productKey: "coin_100", isActive: true },
      { icon: "", coin: 500, bonusCoin: 150, price: 4.99, offerPrice: 3.99, productKey: "coin_500", isActive: true },
      { icon: "", coin: 1000, bonusCoin: 400, price: 9.99, offerPrice: 7.99, productKey: "coin_1000", isActive: true },
      { icon: "", coin: 2500, bonusCoin: 1200, price: 19.99, offerPrice: 14.99, productKey: "coin_2500", isActive: true },
    ]);
    console.log("Seeded 4 Coin Plans.");
  }

  // 5. VIP Plans
  const existingVipPlans = await VipPlan.countDocuments();
  if (existingVipPlans === 0) {
    await VipPlan.insertMany([
      { validity: 7, validityType: "Day", price: 4.99, offerPrice: 2.99, tags: "POPULAR", productKey: "vip_weekly", isActive: true },
      { validity: 1, validityType: "Month", price: 14.99, offerPrice: 9.99, tags: "BEST VALUE", productKey: "vip_monthly", isActive: true },
      { validity: 1, validityType: "Year", price: 69.99, offerPrice: 49.99, tags: "VIP EXCLUSIVE", productKey: "vip_yearly", isActive: true },
    ]);
    console.log("Seeded 3 VIP Plans.");
  }

  console.log("Demo data seeding completed successfully!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding demo data:", err);
  process.exit(1);
});
