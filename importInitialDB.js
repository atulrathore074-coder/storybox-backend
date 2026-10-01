const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

function parseBson(obj) {
  if (Array.isArray(obj)) return obj.map(parseBson);
  if (obj !== null && typeof obj === "object") {
    if (obj["$oid"]) return new mongoose.Types.ObjectId(obj["$oid"]);
    if (obj["$date"]) return new Date(obj["$date"]);
    const res = {};
    for (const key of Object.keys(obj)) {
      res[key] = parseBson(obj[key]);
    }
    return res;
  }
  return obj;
}

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/storybox");
  const dbDir = path.resolve(__dirname, "../../../DB");
  const files = [
    { file: "adrewards.json", collection: "adrewards" },
    { file: "currencies.json", collection: "currencies" },
    { file: "dailyrewards.json", collection: "dailyrewards" },
    { file: "reportreasons.json", collection: "reportreasons" },
    { file: "settings.json", collection: "settings" },
  ];

  for (const { file, collection } of files) {
    const filePath = path.join(dbDir, file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const parsed = parseBson(data);
      const count = await mongoose.connection.db.collection(collection).countDocuments();
      if (count === 0 && parsed.length > 0) {
        await mongoose.connection.db.collection(collection).insertMany(parsed);
        console.log(`Inserted ${parsed.length} records into ${collection}`);
      } else {
        console.log(`${collection} already has ${count} records`);
      }
    }
  }
  console.log("DB initial data check/import finished.");
  process.exit(0);
}

run().catch((e) => {
  console.error("Error importing DB:", e);
  process.exit(1);
});
