const admin = require("firebase-admin");

const initFirebase = () => {
  try {
    const privateKey = global.settingJSON?.privateKey;
    if (privateKey && privateKey.project_id && privateKey.client_email && privateKey.private_key) {
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(privateKey),
        });
        console.log("✅ Firebase Admin SDK initialized successfully");
      }
    } else {
      console.warn("⚠️ Firebase Admin SDK: privateKey not provided in settings, skipping initialization.");
    }
    return admin;
  } catch (error) {
    console.warn("⚠️ Failed to initialize Firebase Admin SDK:", error.message);
    return admin;
  }
};

module.exports = initFirebase();

