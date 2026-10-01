const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env" });

const dbPath = path.resolve(__dirname, "../../../DB");

function parseEJSON(data) {
  if (Array.isArray(data)) {
    return data.map(parseEJSON);
  }
  if (data !== null && typeof data === "object") {
    if ("$oid" in data) {
      return new mongoose.Types.ObjectId(data.$oid);
    }
    if ("$date" in data) {
      return new Date(data.$date);
    }
    const res = {};
    for (const key in data) {
      res[key] = parseEJSON(data[key]);
    }
    return res;
  }
  return data;
}

async function runSeed() {
  const uri = process.env.MongoDb_Connection_String || "mongodb://127.0.0.1:27017/storybox";
  console.log("Connecting to MongoDB:", uri);
  await mongoose.connect(uri);
  console.log("Connected to MongoDB successfully!");

  const db = mongoose.connection.db;

  const filesMap = [
    { file: "settings.json", coll: "settings" },
    { file: "currencies.json", coll: "currencies" },
    { file: "adrewards.json", coll: "adrewards" },
    { file: "dailyrewards.json", coll: "dailyrewards" },
    { file: "reportreasons.json", coll: "reportreasons" },
  ];

  for (const item of filesMap) {
    const fullPath = path.join(dbPath, item.file);
    if (fs.existsSync(fullPath)) {
      const raw = fs.readFileSync(fullPath, "utf8");
      const docs = parseEJSON(JSON.parse(raw));
      const collection = db.collection(item.coll);
      const count = await collection.countDocuments();
      if (count === 0 && docs.length > 0) {
        await collection.insertMany(docs);
        console.log(`Seeded ${docs.length} records into '${item.coll}'`);
      } else {
        console.log(`Collection '${item.coll}' already has ${count} records. Skipped.`);
      }
    } else {
      console.log(`File not found: ${fullPath}`);
    }
  }

  console.log("All collections seeded successfully!");
  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
