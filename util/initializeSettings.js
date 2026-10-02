//import model
const Setting = require("../models/setting.model");

//settingJson
const settingJson = require("../setting");

// Always set default settings upfront
global.settingJSON = settingJson;

async function initializeSettings() {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (setting) {
      global.settingJSON = setting;
      console.log("✅ Settings Initialized from Database");
    } else {
      global.settingJSON = settingJson;
      console.log("ℹ️ Using default setting.js");
    }
  } catch (error) {
    console.warn("⚠️ Could not load settings from DB, using fallback setting.js:", error.message);
    global.settingJSON = settingJson;
  }
}

module.exports = initializeSettings;

