const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

async function fix() {
  const uri = process.env.MongoDb_Connection_String || "mongodb://127.0.0.1:27017/storybox";
  await mongoose.connect(uri);

  const res = await mongoose.connection.db.collection("shortvideos").updateMany(
    { $or: [{ videoUrl: { $regex: "googleapis" } }, { videoUrl: { $regex: "localhost" } }] },
    { $set: { videoUrl: "http://192.168.29.168:5000/uploads/sample_episode.mp4" } }
  );

  console.log("Updated broken demo videos to local working MP4:", res.modifiedCount);
  await mongoose.disconnect();
}

fix().catch(console.error);
