const WatchHistory = require("../../models/watchHistory.model");

//import model
const User = require("../../models/user.model");
const ShortVideo = require("../../models/shortVideo.model");

//creating and potentially updating watch history records of the particular video (view the shortvideo)
exports.handleWatchHistoryCreation = async (req, res) => {
  try {
    const { userId, videoId, currentWatchTime } = req.query;

    if (!userId || !videoId || !currentWatchTime) {
      return res.status(200).json({ status: false, message: "Invalid details provided." });
    }

    const watchTimeInSeconds = Math.round(parseFloat(currentWatchTime));
    console.log("Watch time in seconds:", watchTimeInSeconds);

    const [user, shortVideo, existingWatchHistory] = await Promise.all([User.findById(userId), ShortVideo.findById(videoId), WatchHistory.findOne({ userId, videoId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found." });
    }
    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    if (!shortVideo) {
      return res.status(200).json({ status: false, message: "Video not found." });
    }

    res.status(200).json({ status: true, message: "Watch history created or updated successfully." });

    if (!existingWatchHistory) {
      await WatchHistory.create({
        userId,
        videoId,
        movieSeries: shortVideo.movieSeries,
        totalWatchTime: watchTimeInSeconds,
      });
    } else {
      existingWatchHistory.totalWatchTime = watchTimeInSeconds;
      await existingWatchHistory.save();
    }
  } catch (error) {
    console.error("Error in handleWatchHistoryCreation:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
