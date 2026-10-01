const User = require("../../models/user.model");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

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

//update userInfo
exports.modifyUserInfo = async (req, res) => {
  try {
    if (!req.body.userId) {
      if (req?.body?.profilePic) {
        await deleteFromStorage(req?.body?.profilePic);
      }

      return res.status(200).json({ status: false, message: "userId must be requried." });
    }

    const user = await User.findOne({ _id: req.body.userId });
    if (!user) {
      if (req?.body?.profilePic) {
        await deleteFromStorage(req?.body?.profilePic);
      }

      return res.status(200).json({ status: false, message: "user does not found!" });
    }

    if (req?.body?.profilePic) {
      if (user?.profilePic) {
        await deleteFromStorage(user?.profilePic);
      }

      user.profilePic = req?.body?.profilePic ? req?.body?.profilePic : user.profilePic;
    }

    user.name = req.body.name ? req.body.name : user.name;
    user.username = req.body.username ? req.body.username : user.username;
    user.gender = req.body.gender ? req.body.gender.toLowerCase() : user.gender;
    user.bio = req.body.bio ? req.body.bio : user.bio;
    user.age = req.body.age ? req.body.age : user.age;
    user.country = req.body.country ? req.body.country : user.country;
    user.email = req.body.email ? req.body.email : user.email;
    user.mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : user.mobileNumber;
    await user.save();

    return res.status(200).json({ status: true, message: "Update profile of the user by the admin.", data: user });
  } catch (error) {
    if (req?.body?.profilePic) {
      await deleteFromStorage(req?.body?.profilePic);
    }

    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle block of the user
exports.isBlock = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const userId = req.query.userId;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(200).json({ status: false, message: "User not found." });
    }

    user.isBlock = !user.isBlock;
    await user.save();

    return res.status(200).json({ status: true, message: "Block of the user handled by admin!", data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get user profile
exports.retriveUserProfile = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const user = await User.findOne({ _id: req.query.userId }).lean();
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    return res.status(200).json({ status: true, message: "The user has retrieved their profile.", user: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get users
exports.getUsersByAdmin = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const searchString = req.query.search || "";

    let searchQuery = {};
    if (searchString !== "All" && searchString !== "") {
      searchQuery = {
        $or: [{ name: { $regex: searchString, $options: "i" } }, { username: { $regex: searchString, $options: "i" } }, { uniqueId: { $regex: searchString, $options: "i" } }],
      };
    }

    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid Details!" });
    }

    let dateFilterQuery = {};
    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const [totalUsers, data] = await Promise.all([
      User.countDocuments({ ...dateFilterQuery, ...searchQuery }),
      User.find({ ...dateFilterQuery, ...searchQuery })
        .select("name username gender profilePic isVip coin lastLogin date isBlock loginType uniqueId")
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrive Users Successfully.",
      totalUsers: totalUsers,
      user: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete user
exports.deactivateUser = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be required!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const user = await User.findOne({ _id: userId, loginType: { $in: [1, 2, 4] } });

    if (user && user?.loginType === 3) {
      return res.status(200).json({
        status: false,
        message: "This user cannot be deleted as they are using quick login. Please contact support if necessary.",
      });
    }

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
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
