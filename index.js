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
  // Step 1: Mount routes immediately
  const routes = require("./routes/index");
  app.use("/api", routes);

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.get("/", (req, res) => {
    res.status(200).json({ status: true, message: "StoryBox Backend is running successfully!" });
  });

  db.on("error", (err) => {
    console.log("Mongo Connection Error: ", err?.message || err);
  });

  db.once("open", async () => {
    console.log("Mongo: successfully connected to db");
    await initializeSettings();
  });

  // Step 2: Start Server immediately on 0.0.0.0
  const port = process.env.PORT ? parseInt(process.env.PORT) : 10000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Hello World ! listening on 0.0.0.0:${port}`);
  });

  if (port !== 10000) {
    try {
      app.listen(10000, "0.0.0.0", () => {
        console.log("Also listening on 0.0.0.0:10000 for Render");
      });
    } catch (e) {}
  }
  if (port !== 5000) {
    try {
      app.listen(5000, "0.0.0.0", () => {
        console.log("Also listening on 0.0.0.0:5000");
      });
    } catch (e) {}
  }

  // Attempt initial settings load
  initializeSettings();
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
