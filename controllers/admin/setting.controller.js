const Setting = require("../../models/setting.model");

//import model
const ShortVideo = require("../../models/shortVideo.model");

//update setting
exports.updateSetting = async (req, res) => {
  try {
    const settingId = req.query.settingId;
    if (!settingId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const setting = await Setting.findById(settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "setting does not found." });
    }

    // Update short videos based on freeEpisodesForNonVip
    if (req.body.freeEpisodesForNonVip !== undefined) {
      const freeEpisodes = parseInt(req.body.freeEpisodesForNonVip);

      await Promise.all([
        ShortVideo.updateMany({ episodeNumber: { $gt: freeEpisodes } }, { $set: { isLocked: true, coin: 10 } }),
        ShortVideo.updateMany({ episodeNumber: 0 }, { $set: { isLocked: false, coin: 0 } }),
        ShortVideo.updateMany({ episodeNumber: { $gte: 1, $lte: freeEpisodes } }, { $set: { isLocked: false, coin: 0 } }),
      ]);
    }

    setting.privacyPolicyLink = req.body.privacyPolicyLink ? req.body.privacyPolicyLink : setting.privacyPolicyLink;
    setting.termsOfUsePolicyLink = req.body.termsOfUsePolicyLink ? req.body.termsOfUsePolicyLink : setting.termsOfUsePolicyLink;
    setting.contactEmail = req.body.contactEmail ? req.body.contactEmail.trim() : setting.contactEmail;
    setting.resendApiKey = req.body.resendApiKey ? req.body.resendApiKey.trim() : setting.resendApiKey;
    setting.stripePublishableKey = req.body.stripePublishableKey ? req.body.stripePublishableKey : setting.stripePublishableKey;
    setting.stripeSecretKey = req.body.stripeSecretKey ? req.body.stripeSecretKey : setting.stripeSecretKey;
    setting.razorPayId = req.body.razorPayId ? req.body.razorPayId : setting.razorPayId;
    setting.razorSecretKey = req.body.razorSecretKey ? req.body.razorSecretKey : setting.razorSecretKey;
    setting.flutterWaveId = req.body.flutterWaveId ? req.body.flutterWaveId : setting.flutterWaveId;
    setting.durationOfShorts = parseInt(req.body.durationOfShorts) ? parseInt(req.body.durationOfShorts) : setting.durationOfShorts;
    setting.freeEpisodesForNonVip = parseInt(req.body.freeEpisodesForNonVip) ? parseInt(req.body.freeEpisodesForNonVip) : setting.freeEpisodesForNonVip;
    setting.minCoinForCashOut = parseInt(req.body.minCoinForCashOut) ? parseInt(req.body.minCoinForCashOut) : setting.minCoinForCashOut;
    setting.minWithdrawalRequestedCoin = req.body.minWithdrawalRequestedCoin ? parseInt(req.body.minWithdrawalRequestedCoin) : setting.minWithdrawalRequestedCoin;
    setting.loginRewardCoins = parseInt(req.body.loginRewardCoins) ? parseInt(req.body.loginRewardCoins) : setting.loginRewardCoins;
    setting.referralRewardCoins = parseInt(req.body.referralRewardCoins) ? parseInt(req.body.referralRewardCoins) : setting.referralRewardCoins;
    setting.privateKey = req.body.privateKey ? JSON.parse(req.body.privateKey.trim()) : setting.privateKey;
    setting.maxAdPerDay = parseInt(req.body.maxAdPerDay) ? parseInt(req.body.maxAdPerDay) : setting.maxAdPerDay;
    setting.android.google.interstitial = req.body.androidGoogleInterstitial ? req.body.androidGoogleInterstitial : setting.android.google.interstitial;
    setting.android.google.native = req.body.androidGoogleNative ? req.body.androidGoogleNative : setting.android.google.native;
    setting.android.google.reward = req.body.androidGoogleReward ? req.body.androidGoogleReward : setting.android.google.reward;
    setting.ios.google.interstitial = req.body.iosGoogleInterstitial ? req.body.iosGoogleInterstitial : setting.ios.google.interstitial;
    setting.ios.google.native = req.body.iosGoogleNative ? req.body.iosGoogleNative : setting.ios.google.native;
    setting.ios.google.reward = req.body.iosGoogleReward ? req.body.iosGoogleReward : setting.ios.google.reward;

    setting.doEndpoint = req.body.doEndpoint ? req.body.doEndpoint : setting.doEndpoint;
    setting.doAccessKey = req.body.doAccessKey ? req.body.doAccessKey : setting.doAccessKey;
    setting.doSecretKey = req.body.doSecretKey ? req.body.doSecretKey : setting.doSecretKey;
    setting.doHostname = req.body.doHostname ? req.body.doHostname : setting.doHostname;
    setting.doBucketName = req.body.doBucketName ? req.body.doBucketName : setting.doBucketName;
    setting.doRegion = req.body.doRegion ? req.body.doRegion : setting.doRegion;

    setting.awsEndpoint = req.body.awsEndpoint ? req.body.awsEndpoint : setting.awsEndpoint;
    setting.awsAccessKey = req.body.awsAccessKey ? req.body.awsAccessKey : setting.awsAccessKey;
    setting.awsSecretKey = req.body.awsSecretKey ? req.body.awsSecretKey : setting.awsSecretKey;
    setting.awsHostname = req.body.awsHostname ? req.body.awsHostname : setting.awsHostname;
    setting.awsBucketName = req.body.awsBucketName ? req.body.awsBucketName : setting.awsBucketName;
    setting.awsRegion = req.body.awsRegion ? req.body.awsRegion : setting.awsRegion;

    await setting.save();

    updateSettingFile(setting);

    res.status(200).json({
      status: true,
      message: "Setting updated Successfully",
      data: setting,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//get setting
exports.fetchSettingByAdmin = async (req, res) => {
  try {
    const setting = settingJSON ? settingJSON : null;
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Setting fetch Successfully",
      data: setting,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle activation of the switch
exports.handleSwitch = async (req, res) => {
  try {
    const settingId = req?.query?.settingId;
    const type = req?.query?.type?.trim();

    if (!settingId || !type) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const setting = await Setting.findById(settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "setting does not found." });
    }

    if (type === "isGoogle") {
      setting.isGoogle = !setting.isGoogle;
    } else if (type === "googlePlaySwitch") {
      setting.googlePlaySwitch = !setting.googlePlaySwitch;
    } else if (type === "stripeSwitch") {
      setting.stripeSwitch = !setting.stripeSwitch;
    } else if (type === "razorPaySwitch") {
      setting.razorPaySwitch = !setting.razorPaySwitch;
    } else if (type === "flutterWaveSwitch") {
      setting.flutterWaveSwitch = !setting.flutterWaveSwitch;
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }

    await setting.save();

    updateSettingFile(setting);

    return res.status(200).json({
      status: true,
      message: "Setting updated Successfully",
      data: setting,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle update storage
exports.handleStorageSwitch = async (req, res) => {
  try {
    const settingId = req?.query?.settingId;
    const type = req?.query?.type?.trim();

    if (!settingId || !type) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const setting = await Setting.findById(settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting not found." });
    }

    // Ensure only one storage is true at a time
    if (type === "local") {
      setting.storage.local = !setting.storage.local;
      if (setting.storage.local) {
        setting.storage.awsS3 = false;
        setting.storage.digitalOcean = false;
      }
    } else if (type === "awsS3") {
      setting.storage.awsS3 = !setting.storage.awsS3;
      if (setting.storage.awsS3) {
        setting.storage.local = false;
        setting.storage.digitalOcean = false;
      }
    } else if (type === "digitalOcean") {
      setting.storage.digitalOcean = !setting.storage.digitalOcean;
      if (setting.storage.digitalOcean) {
        setting.storage.local = false;
        setting.storage.awsS3 = false;
      }
    } else {
      return res.status(200).json({ status: false, message: "Invalid storage type provided." });
    }

    await setting.save();
    updateSettingFile(setting);

    return res.status(200).json({
      status: true,
      message: "Storage setting updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
