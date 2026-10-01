const User = require("../../models/user.model");

//import model
const WatchHistory = require("../../models/watchHistory.model");
const CheckIn = require("../../models/checkIn.model");
const CoinPlanHistory = require("../../models/coinplanHistory.model");
const History = require("../../models/history.model");
const LikeHistoryOfVideo = require("../../models/likeHistoryOfVideo.model");
const Report = require("../../models/report.model");
const UserVideoList = require("../../models/userVideoList.model");
const VipPlanHistory = require("../../models/vipPlanHistory.model");
const WithdrawRequest = require("../../models/withDrawRequest.model");

//mongoose
const mongoose = require("mongoose");

//Cryptr
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

//generateUniqueId
const { generateUniqueId } = require("../../util/generateUniqueId");

//generateHistoryUniqueId
const { generateHistoryUniqueId } = require("../../util/generateHistoryUniqueId");

//generateReferralCode
const { generateReferralCode } = require("../../util/generateReferralCode");

//private key
const admin = require("../../util/privateKey");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

//checkVipPlan
const { checkVipPlan } = require("../../util/checkVipPlan");

//user function
const userFunction = async (user, data_) => {
  const data = data_.body;

  user.name = data?.name ? data?.name?.trim() : user.name;
  user.username = data?.username ? data?.username?.trim() : user.username;
  user.gender = data?.gender ? data?.gender?.toLowerCase().trim() : user.gender;
  user.bio = data?.bio ? data?.bio?.trim() : user.bio;
  user.age = data?.age ? data?.age : user.age;
  user.profilePic = data?.profilePic ? data?.profilePic : user.profilePic;
  user.country = data.country ? data.country.toLowerCase() : user.country;
  user.email = data?.email ? data?.email?.trim() : user.email;
  user.mobileNumber = data.mobileNumber ? data.mobileNumber : user.mobileNumber;
  user.identity = data.identity ? data.identity : user.identity;
  user.loginType = data.loginType ? data.loginType : user.loginType;
  user.fcmToken = data.fcmToken ? data.fcmToken : user.fcmToken;
  user.uniqueId = !user.uniqueId ? await generateUniqueId() : user.uniqueId;

  await user.save();
  return user;
};

//check the user is exists or not with loginType 3 quick(identity)
exports.checkUser = async (req, res) => {
  try {
    if (!req.query.identity) {
      return res.status(200).json({ status: false, message: "identity must be requried." });
    }

    const user = await User.findOne({ identity: req.query.identity.trim(), loginType: 3 });
    if (user) {
      return res.status(200).json({
        status: true,
        message: "User login Successfully.",
        isLogin: true,
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "User must have to sign up.",
        isLogin: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Sever Error" });
  }
};

//user login and sign up
exports.loginOrSignUp = async (req, res) => {
  try {
    if (!req.body.identity || !req.body.loginType || !req.body.fcmToken) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    let userQuery;

    const loginType = req?.body?.loginType;
    const identity = req?.body?.identity;

    if (loginType === 1) {
      if (!req.body.mobileNumber) {
        return res.status(200).json({ status: false, message: "mobileNumber must be required." });
      }

      userQuery = await User.findOne({ mobileNumber: req.body.mobileNumber?.trim() });
    } else if (loginType === 2 || loginType === 4) {
      if (!req.body.email) {
        return res.status(200).json({ status: false, message: "email must be required." });
      }

      userQuery = await User.findOne({ email: req?.body?.email?.trim() });
    } else if (loginType === 3) {
      if (!req.body.identity) {
        return res.status(200).json({ status: false, message: "identity must be required." });
      }

      userQuery = await User.findOne({ identity: identity, email: req?.body?.email?.trim() }); //email field always be identity
    } else {
      return res.status(200).json({ status: false, message: "loginType must be passed valid." });
    }

    const user = userQuery;

    if (user) {
      console.log("User is already exist ............");

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by the admin." });
      }

      user.profilePic = req.body.profilePic ? req.body.profilePic : user.profilePic;
      user.name = req.body.name ? req.body.name : user.name;
      user.username = req.body.username ? req.body.username : user.username;
      user.fcmToken = req.body.fcmToken ? req.body.fcmToken : user.fcmToken;
      user.lastLogin = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

      if (loginType === 3) {
        const user_ = await userFunction(user, req);

        return res.status(200).json({
          status: true,
          message: "The user has successfully logged in.",
          user: user_,
          signUp: false,
        });
      }

      return res.status(200).json({
        status: true,
        message: "The user has successfully logged in.",
        user: user,
        signUp: false,
      });
    } else {
      console.log("User signup:    ");

      let referralCode;
      let isUnique = false;

      while (!isUnique) {
        referralCode = generateReferralCode();
        const existingUser = await User.findOne({ referralCode });
        if (!existingUser) {
          isUnique = true;
        }
      }

      const bonusCoins = settingJSON.loginRewardCoins ? settingJSON.loginRewardCoins : 5000;

      const newUser = new User();
      newUser.referralCode = referralCode;
      newUser.coin = bonusCoins;
      newUser.rewardCoin = bonusCoins;
      newUser.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

      const user = await userFunction(newUser, req);

      res.status(200).json({
        status: true,
        message: "A new user has registered an account.",
        signUp: true,
        user: user,
      });

      const uniqueId = await generateHistoryUniqueId();
      await History.create({
        userId: newUser._id,
        coin: bonusCoins,
        uniqueId: uniqueId,
        type: 3,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      });

      if (user.fcmToken && user.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: user.fcmToken,
          notification: {
            title: "🎁 Welcome Bonus! 🎁",
            body: "✨ Congratulations! You have received a login bonus. Thank you for joining us.",
          },
          data: {
            type: "LOGINBONUS",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then((response) => {
            console.log("Successfully sent with response: ", response);
          })
          .catch((error) => {
            console.log("Error sending message: ", error);
          });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Sever Error" });
  }
};

//update profile of the user
exports.updateProfile = async (req, res) => {
  try {
    if (!req.query.userId) {
      if (req?.body?.profilePic) {
        await deleteFromStorage(req?.body?.profilePic);
      }

      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const user = await User.findOne({ _id: req.query.userId });
    if (!user) {
      if (req?.body?.profilePic) {
        await deleteFromStorage(req?.body?.profilePic);
      }

      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      if (req?.body?.profilePic) {
        await deleteFromStorage(req?.body?.profilePic);
      }

      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (req?.body?.profilePic) {
      if (user?.profilePic) {
        await deleteFromStorage(user?.profilePic);
      }

      user.profilePic = req?.body?.profilePic ? req?.body?.profilePic : user.profilePic;
    }

    user.name = req.body.name ? req.body.name : user.name;
    user.username = req.body.username ? req.body.username : user.username;
    user.mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : user.mobileNumber;
    user.gender = req.body.gender ? req.body.gender?.toLowerCase()?.trim() : user.gender;
    user.bio = req.body.bio ? req.body.bio : user.bio;
    user.country = req.body.country ? req.body.country.toLowerCase() : user.country;
    await user.save();

    return res.status(200).json({ status: true, message: "The user's profile has been modified.", user: user });
  } catch (error) {
    if (req?.body?.profilePic) {
      await deleteFromStorage(req?.body?.profilePic);
    }

    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get user profile who login
exports.fetchProfile = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const user = await User.findOne({ _id: req.query.userId }).lean();
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (user.isVip && user.vipPlanStartDate !== null) {
      console.log("VIP User :              ", user.isVip);

      const updatedUserData = await checkVipPlan(user._id);

      return res.status(200).json({
        status: true,
        message: "The user has retrieved their profile.",
        user: updatedUserData,
      });
    }

    return res.status(200).json({ status: true, message: "The user has retrieved their profile.", user: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//check referral code is valid and apply referral code by user
exports.validateAndApplyReferralCode = async (req, res) => {
  try {
    const { userId, referralCode } = req.query;

    if (!userId || !referralCode) {
      return res.status(200).json({ status: false, message: "Invalid input details." });
    }

    if (!settingJSON) {
      return res.status(200).json({ message: "Referral settings not found" });
    }

    const [uniqueId, user, referralCodeUser] = await Promise.all([
      generateHistoryUniqueId(),
      User.findById(userId), //the user being referred
      User.findOne({ referralCode: referralCode.trim() }), //the referring user (who share their referral code) by their referral code
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "Referred user does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "Your account has been blocked by the administrator." });
    }

    if (user.referralCode === referralCode.trim()) {
      return res.status(200).json({ status: false, message: "You cannot use your own referral code." });
    }

    if (!referralCodeUser) {
      return res.status(200).json({ status: false, message: "Invalid referral code. The referred user does not exist." });
    }

    if (!user.isReferral) {
      res.status(200).json({ message: "Referral tracked and updated successfully" });

      const [updatedUser, updatedReferralCodeUser, referralHistory] = await Promise.all([
        User.findOneAndUpdate(
          { _id: user._id },
          {
            $set: { isReferral: true },
          },
          { new: true }
        ),
        User.findOneAndUpdate(
          { _id: referralCodeUser._id },
          {
            $inc: {
              coin: settingJSON?.referralRewardCoins,
              rewardCoin: settingJSON?.referralRewardCoins,
              referralCount: 1,
            },
          },
          { new: true }
        ),
        History({
          userId: referralCodeUser._id,
          uniqueId: uniqueId,
          coin: settingJSON?.referralRewardCoins,
          type: 4,
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        }).save(),
      ]);
    } else {
      return res.status(200).json({ status: false, message: "Referral code has already been used by this user." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//earn coin from watching ad
exports.handleAdWatchReward = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.coinEarnedFromAd) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const coinEarnedFromAd = parseInt(req.query.coinEarnedFromAd);

    const [uniqueId, user] = await Promise.all([generateHistoryUniqueId(), User.findOne({ _id: req.query.userId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD' format
    console.log("Today in Ad reward: ", today);

    if (user.watchAds && user.watchAds.date !== null && new Date(user.watchAds.date).toISOString().slice(0, 10) === today && user.watchAds.count >= settingJSON.maxAdPerDay) {
      return res.status(200).json({ status: false, message: "Ad view limit exceeded for today." });
    }

    const [updatedReceiver, historyEntry] = await Promise.all([
      User.findOneAndUpdate(
        { _id: user._id },
        {
          $inc: {
            coin: coinEarnedFromAd,
            rewardCoin: coinEarnedFromAd,
            "watchAds.count": 1,
          },
          $set: {
            "watchAds.date": today,
          },
        },
        { new: true }
      ),
      History({
        userId: user._id,
        uniqueId: uniqueId,
        coin: coinEarnedFromAd,
        type: 2,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }).save(),
    ]);

    console.log("updatedReceiver", updatedReceiver.coin);

    return res.status(200).json({ status: true, message: "Coin earned successfully.", data: updatedReceiver });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete user account
exports.deleteUserAccount = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be required!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    res.status(200).json({ status: true, message: "User has been successfully deleted." });

    if (user?.profilePic) {
      await deleteFromStorage(user?.profilePic);
    }

    await Promise.all([
      WatchHistory.deleteMany({ userId: user?._id }),
      CheckIn.deleteMany({ userId: user?._id }),
      CoinPlanHistory.deleteMany({ userId: user?._id }),
      History.deleteMany({ userId: user?._id }),
      LikeHistoryOfVideo.deleteMany({ userId: user?._id }),
      Report.deleteMany({ userId: user?._id }),
      UserVideoList.deleteMany({ userId: user?._id }),
      VipPlanHistory.deleteMany({ userId: user?._id }),
      WithdrawRequest.deleteMany({ userId: user?._id }),
    ]);

    await User.deleteOne({ _id: user?._id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//user login or sign up ( web )
exports.authenticateOrRegister = async (req, res) => {
  try {
    const { loginType, fcmToken, email } = req.body;

    if (
      loginType === undefined
      //|| !fcmToken
    ) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!!" });
    }

    // Retrieve uid and provider from the validated Firebase token
    const { uid, provider } = req.user; // ✅ Get values from req.user

    let userQuery;

    switch (loginType) {
      case 2:
        if (!email) return res.status(200).json({ status: false, message: "email is required." });
        userQuery = { email };
        break;

      default:
        return res.status(200).json({ status: false, message: "Invalid loginType." });
    }

    let user = null;
    if (Object.keys(userQuery).length > 0) {
      // ✅ Only query if there are conditions
      user = await User.findOne(userQuery);
    }

    if (user) {
      console.log("✅ User already exists, logging in...");

      if (user.isBlock) {
        return res.status(403).json({ status: false, message: "🚷 User is blocked by the admin." });
      }

      user.fcmToken = fcmToken ? fcmToken : user.fcmToken;
      user.lastLogin = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      await user.save();

      return res.status(200).json({ status: true, message: "User logged in.", signUp: false, user });
    } else {
      console.log("🆕 Registering new user...");

      let referralCode;
      let isUnique = false;

      while (!isUnique) {
        referralCode = generateReferralCode();
        const existingUser = await User.findOne({ referralCode });
        if (!existingUser) {
          isUnique = true;
        }
      }

      const bonusCoins = settingJSON.loginRewardCoins ? settingJSON.loginRewardCoins : 5000;

      const newUser = new User();
      newUser.firebaseUid = uid;
      newUser.signInProvider = provider;
      newUser.referralCode = referralCode;
      newUser.coin = bonusCoins;
      newUser.rewardCoin = bonusCoins;
      newUser.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

      const user = await userFunction(newUser, req);

      res.status(200).json({
        status: true,
        message: "A new user has registered an account.",
        signUp: true,
        user,
      });

      const uniqueId = await generateHistoryUniqueId();

      const [historyEntry] = await Promise.all([
        History.create({
          userId: newUser._id,
          coin: bonusCoins,
          uniqueId: uniqueId,
          type: 3,
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        }),
      ]);

      if (user.fcmToken && user.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: user.fcmToken,
          notification: {
            title: "🎊 Welcome Bonus Activated! 🎁✨",
            body: "🥳 Hooray! You've received an exclusive login bonus. Enjoy your reward and have a great experience with us! 🚀💎",
          },
          data: {
            type: "LOGINBONUS",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then((response) => {
            console.log("Successfully sent with response: ", response);
          })
          .catch((error) => {
            console.log("Error sending message: ", error);
          });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
