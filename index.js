const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

//express
const express = require("express");
const app = express();

//cors
const cors = require("cors");

app.use(cors());
app.use(express.json());

//logging middleware
const logger = require("morgan");
app.use(logger("dev"));

//compression
const compression = require("compression");
app.use(compression());

//path
const path = require("path");

//fs
const fs = require("fs");

//dotenv
require("dotenv").config({ path: ".env" });

//Declare global variable
global.settingJSON = {};

//Declare the function as a global variable to update the setting.js file
global.updateSettingFile = (settingData) => {
  const settingJSON = JSON.stringify(settingData, null, 2);
  fs.writeFileSync("setting.js", `module.exports = ${settingJSON};`, "utf8");

  global.settingJSON = settingData; // Update global variable
  console.log("Settings file updated.");
};

//connection.js
const db = require("./util/connection");

// Step 1: Import initializeSettings
const initializeSettings = require("./util/initializeSettings");

async function startServer() {
  console.log("🔄 Initializing settings...");
  await initializeSettings(); // Ensure settings are loaded before other modules

  console.log("✅ Settings Loaded");

  // Step 2: Require all other modules after settings are initialized
  const routes = require("./routes/index");
  app.use("/api", routes);

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  db.on("error", () => {
    console.log("Connection Error: ");
  });

  db.once("open", async () => {
    console.log("Mongo: successfully connected to db");
  });

  // Step 3: Start Server after all setup is done
  app.listen(process?.env.PORT, () => {
    console.log("Hello World ! listening on " + process.env.PORT);
  });
}

// Run server startup
startServer();

//node-cron
const cron = require("node-cron");

//import model
const User = require("./models/user.model");

//this run for update user's daily watch Ads
cron.schedule("0 0 * * *", async () => {
  await User.updateMany(
    {
      "watchAds.count": { $gt: 0 },
      "watchAds.date": { $ne: null },
    },
    {
      $set: {
        "watchAds.count": 0,
        "watchAds.date": null,
      },
    }
  );
});

//this run for update user's daily watch Ads for unlock episodes
cron.schedule("0 0 * * *", async () => {
  try {
    await User.updateMany(
      {
        episodeUnlockAds: { $exists: true, $not: { $size: 0 } },
        "episodeUnlockAds.count": { $gt: 0 },
      },
      {
        $set: {
          "episodeUnlockAds.$[].count": 0,
          "episodeUnlockAds.$[].date": null,
        },
      }
    );
    console.log("Cron job executed: Reset episodeUnlockAds for all users.");
  } catch (error) {
    console.error("Error resetting episodeUnlockAds:", error);
  }
});
