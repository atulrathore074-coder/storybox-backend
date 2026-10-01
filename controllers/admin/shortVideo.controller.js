const ShortVideo = require("../../models/shortVideo.model");

//import model
const MovieSeries = require("../../models/movieSeries.model");
const User = require("../../models/user.model");

//mongoose
const mongoose = require("mongoose");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

//private key
const admin = require("../../util/privateKey");

//validate whether an episode requires coins or not
exports.validateEpisodeLock = async (req, res) => {
  try {
    if (!settingJSON) {
      return res.status(200).json({ status: false, message: "Setting does not found!" });
    }

    const { episodeNumber } = req.query;

    if (!episodeNumber) {
      return res.status(200).json({ success: false, message: "Episode number is required." });
    }

    const episodeNumberInt = parseInt(episodeNumber, 10);
    if (isNaN(episodeNumberInt) || episodeNumberInt < 0) {
      return res.status(200).json({ success: false, message: "Invalid episode number." });
    }

    const freeEpisodesForNonVip = settingJSON?.freeEpisodesForNonVip || 0;

    const isLocked = episodeNumberInt > freeEpisodesForNonVip;

    return res.status(200).json({
      success: true,
      message: "Validation completed.",
      isLocked: isLocked,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//create shortVideo (movie or webseries wise)
exports.createShortVideo = async (req, res) => {
  try {
    if (!settingJSON) {
      await Promise.all([req.body.videoImage ? deleteFromStorage(req.body.videoImage) : Promise.resolve(), req.body.videoUrl ? deleteFromStorage(req.body.videoUrl) : Promise.resolve()]);
      return res.status(200).json({ status: false, message: "Setting does not found!" });
    }

    const { movieSeriesId, episodeNumber, videoImage, videoUrl, duration, coin } = req.body;
    const durationOfShorts = settingJSON.durationOfShorts || 30;

    if (!movieSeriesId || episodeNumber === undefined || !videoImage?.trim() || !videoUrl?.trim() || duration === undefined) {
      await Promise.all([req.body.videoImage ? deleteFromStorage(req.body.videoImage) : Promise.resolve(), req.body.videoUrl ? deleteFromStorage(req.body.videoUrl) : Promise.resolve()]);
      return res.status(200).json({ status: false, message: "Missing required fields." });
    }

    if (durationOfShorts < parseInt(duration)) {
      await Promise.all([req.body.videoImage ? deleteFromStorage(req.body.videoImage) : Promise.resolve(), req.body.videoUrl ? deleteFromStorage(req.body.videoUrl) : Promise.resolve()]);
      return res.status(200).json({
        status: false,
        message: "⚠️ Your video duration exceeds the limit set by the admin.",
      });
    }

    const movieSeriesObjId = new mongoose.Types.ObjectId(movieSeriesId);

    const [movieSeries, existingEpisodeZero, existingEpisode] = await Promise.all([
      MovieSeries.findById(movieSeriesObjId).select("_id").lean(),
      ShortVideo.findOne({ movieSeries: movieSeriesObjId, episodeNumber: 0 }).select("_id").lean(),
      ShortVideo.findOne({ movieSeries: movieSeriesObjId, episodeNumber }).select("_id").lean(),
    ]);

    if (!movieSeries) {
      await Promise.all([req.body.videoImage ? deleteFromStorage(req.body.videoImage) : Promise.resolve(), req.body.videoUrl ? deleteFromStorage(req.body.videoUrl) : Promise.resolve()]);
      return res.status(200).json({ status: false, message: "MovieSeries does not found." });
    }

    if (existingEpisode) {
      await Promise.all([req.body.videoImage ? deleteFromStorage(req.body.videoImage) : Promise.resolve(), req.body.videoUrl ? deleteFromStorage(req.body.videoUrl) : Promise.resolve()]);
      return res.status(200).json({ status: false, message: "⚠️ This episode number already exists in the series." });
    }

    if (parseInt(episodeNumber) !== 0 && !existingEpisodeZero) {
      if (!existingEpisodeZero) {
        await Promise.all([req.body.videoImage ? deleteFromStorage(req.body.videoImage) : Promise.resolve(), req.body.videoUrl ? deleteFromStorage(req.body.videoUrl) : Promise.resolve()]);
        return res.status(200).json({ status: false, message: "Episode 0 must be created first before any other episodes." });
      }
    }

    //Check if the episode should be free for non-VIP users
    const isFreeForNonVip = episodeNumber === 0 || parseInt(episodeNumber) <= (settingJSON?.freeEpisodesForNonVip || 0);

    // Determine if the video is locked based on whether it's free or paid
    const isLocked = !isFreeForNonVip; // If free, locked should be false; if paid, true

    console.log("If free, locked should be false; if paid, true", isLocked);

    const shortVideo = new ShortVideo({
      movieSeries: movieSeries._id,
      episodeNumber: parseInt(episodeNumber),
      videoImage,
      videoUrl,
      coin: coin || 0,
      duration: parseInt(duration),
      releaseDate: Date.now(),
      isLocked,
    });

    await shortVideo.save();

    res.status(200).json({
      status: true,
      message: "Content created successfully",
      data: shortVideo,
    });

    const users = await User.find({ isBlock: false }).select("_id fcmToken");
    for (const user of users) {
      if (user.fcmToken && user.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: user.fcmToken,
          notification: {
            title: "🎬 New Short Video Alert! 🚀",
            body: "🔥 A brand-new short video is live! Tap to watch now and enjoy fresh content. 🎥✨",
          },
          data: {
            type: "NEW_SHORT_VIDEO",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then((response) => {
            console.log(`Notification sent successfully to user ${user._id}:`, response);
          })
          .catch((error) => {
            console.log(`Error sending notification to user ${user._id}:`, error);
          });
      }
    }
  } catch (error) {
    await Promise.all([req.body.videoImage ? deleteFromStorage(req.body.videoImage) : Promise.resolve(), req.body.videoUrl ? deleteFromStorage(req.body.videoUrl) : Promise.resolve()]);
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//update shortVideo (movie or webseries wise)
exports.updateShortVideo = async (req, res) => {
  try {
    if (!req.body.shortVideoId) {
      await Promise.all([req.body.videoImage ? deleteFromStorage(req.body.videoImage) : Promise.resolve(), req.body.videoUrl ? deleteFromStorage(req.body.videoUrl) : Promise.resolve()]);
      return res.status(200).json({ status: false, message: "The 'shortVideoId' field is required." });
    }

    const shortVideoId = new mongoose.Types.ObjectId(req.body.shortVideoId);
    const durationOfShorts = settingJSON.durationOfShorts || 30;

    const shortVideo = await ShortVideo.findById(shortVideoId);
    if (!shortVideo) {
      await Promise.all([req.body.videoImage ? deleteFromStorage(req.body.videoImage) : Promise.resolve(), req.body.videoUrl ? deleteFromStorage(req.body.videoUrl) : Promise.resolve()]);
      return res.status(200).json({ status: false, message: "ShortVideo does not found." });
    }

    if (req?.body?.videoUrl && durationOfShorts < parseInt(req.body.duration)) {
      await Promise.all([req.body.videoImage ? deleteFromStorage(req.body.videoImage) : Promise.resolve(), req.body.videoUrl ? deleteFromStorage(req.body.videoUrl) : Promise.resolve()]);
      return res.status(200).json({
        status: false,
        message: "⏳ Your video duration exceeds the limit set by the admin.",
      });
    }

    if (req?.body?.videoImage) {
      if (shortVideo.videoImage) {
        await deleteFromStorage(shortVideo.videoImage);
      }

      shortVideo.videoImage = req.body.videoImage ? req.body.videoImage : shortVideo.videoImage;
    }

    if (req?.body?.videoUrl) {
      if (shortVideo.videoUrl) {
        await deleteFromStorage(shortVideo.videoUrl);
      }

      shortVideo.videoUrl = req.body.videoUrl ? req.body.videoUrl : shortVideo.videoUrl;
    }

    shortVideo.duration = parseInt(req.body.duration) || shortVideo.duration;
    shortVideo.coin = req.body.coin || shortVideo.coin;

    await shortVideo.save();

    return res.status(200).json({
      status: true,
      message: "ShortVideo updated successfully",
      data: shortVideo,
    });
  } catch (error) {
    await Promise.all([req.body.videoImage ? deleteFromStorage(req.body.videoImage) : Promise.resolve(), req.body.videoUrl ? deleteFromStorage(req.body.videoUrl) : Promise.resolve()]);
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//fetch shortVideos
exports.fetchShortVideos = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const [totalShortVideos, shortVideo] = await Promise.all([
      ShortVideo.countDocuments(),
      ShortVideo.find()
        .populate("movieSeries", "name")
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({ status: true, message: "Success", total: totalShortVideos, data: shortVideo });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//fetch particular movie or webseries wise shortVideos
exports.retrieveMovieSeriesVideoData = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    if (!req.query.movieSeriesId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const movieSeriesId = new mongoose.Types.ObjectId(req.query.movieSeriesId);

    const [total, videos] = await Promise.all([
      ShortVideo.countDocuments({ movieSeries: new mongoose.Types.ObjectId(movieSeriesId) }),
      ShortVideo.aggregate([
        {
          $match: {
            movieSeries: new mongoose.Types.ObjectId(movieSeriesId),
          },
        },
        {
          $project: {
            _id: 1,
            episodeNumber: 1,
            videoImage: 1,
            videoUrl: 1,
            coin: 1,
            isLocked: 1,
            releaseDate: 1,
            createdAt: 1,
          },
        },
        { $sort: { episodeNumber: 1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    return res.status(200).json({ status: true, message: "Retrieved videos from a specific movie series.", total: total, data: videos });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//fetching information about a short video
exports.getShortVideoInfo = async (req, res) => {
  try {
    if (!req.query.shortVideoId) {
      return res.status(200).json({ status: false, message: "The 'shortVideoId' field is required." });
    }

    const shortVideoId = new mongoose.Types.ObjectId(req.query.shortVideoId);

    const shortVideo = await ShortVideo.findById(shortVideoId).select("videoUrl").lean();
    if (!shortVideo) {
      return res.status(200).json({ status: false, message: "ShortVideo not found." });
    }

    return res.status(200).json({
      status: true,
      message: "ShortVideo fetched successfully",
      data: shortVideo,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//delete a short video
exports.removeShortMedia = async (req, res) => {
  try {
    if (!req.query.movieSeriesId || !req.query.shortVideoId) {
      return res.status(200).json({ status: false, message: "The `movieSeriesId` and 'shortVideoId' field is required." });
    }

    const shortVideoId = new mongoose.Types.ObjectId(req.query.shortVideoId);
    const movieSeriesId = new mongoose.Types.ObjectId(req.query.movieSeriesId);
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    const shortVideo = await ShortVideo.findById(shortVideoId).select("episodeNumber videoImage videoUrl").lean();
    if (!shortVideo) {
      return res.status(200).json({ status: false, message: "ShortVideo not found." });
    }

    if (shortVideo.episodeNumber == 0) {
      return res.status(200).json({ status: false, message: "Trailer cannot be deleted." });
    }

    await Promise.all([
      shortVideo.videoImage ? deleteFromStorage(shortVideo.videoImage) : null,
      shortVideo.videoUrl ? deleteFromStorage(shortVideo.videoUrl) : null,
      ShortVideo.deleteOne({ _id: shortVideoId }),
    ]);

    const freeEpisodesLimit = settingJSON.freeEpisodesForNonVip || 5;
    const remainingEpisodes = await ShortVideo.find({
      movieSeries: movieSeriesId,
      episodeNumber: { $gt: 0 }, // Exclude Trailer (episodeNumber: 0)
    })
      .sort("episodeNumber")
      .select("_id episodeNumber")
      .lean();

    for (let i = 0; i < remainingEpisodes.length; i++) {
      const newEpisodeNumber = i + 1;
      const isLocked = newEpisodeNumber > freeEpisodesLimit;
      const coin = isLocked ? 10 : 0;

      await ShortVideo.findByIdAndUpdate(remainingEpisodes[i]._id, {
        episodeNumber: newEpisodeNumber,
        isLocked,
        coin,
      });
    }

    const videos = await ShortVideo.aggregate([
      {
        $match: {
          movieSeries: new mongoose.Types.ObjectId(movieSeriesId),
        },
      },
      {
        $project: {
          _id: 1,
          episodeNumber: 1,
          videoImage: 1,
          videoUrl: 1,
          coin: 1,
          isLocked: 1,
          releaseDate: 1,
          createdAt: 1,
        },
      },
      { $sort: { episodeNumber: 1 } },
      { $skip: (start - 1) * limit },
      { $limit: limit },
    ]);

    res.status(200).json({
      status: true,
      message: "ShortVideo deleted successfully, and episode numbers updated.",
      videos,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handles moving an episode to a different position in the sequence and adjusts the episode numbers and lock status accordingly
exports.editShortVideo = async (req, res) => {
  try {
    if (!req.query.movieSeriesId || !req.query.shortVideoId || !req.query.newEpisodePosition) {
      return res.status(200).json({
        status: false,
        message: "The `movieSeriesId`, 'shortVideoId', and 'newEpisodePosition' fields are required.",
      });
    }

    const shortVideoId = new mongoose.Types.ObjectId(req.query.shortVideoId);
    const movieSeriesId = new mongoose.Types.ObjectId(req.query.movieSeriesId);
    const newEpisodePosition = parseInt(req.query.newEpisodePosition, 10);

    const shortVideo = await ShortVideo.findById(shortVideoId).select("episodeNumber videoImage videoUrl isLocked coin").lean();
    if (!shortVideo) {
      return res.status(200).json({ status: false, message: "ShortVideo not found." });
    }

    if (shortVideo.episodeNumber === 0) {
      return res.status(200).json({ status: false, message: "Trailers cannot be moved." });
    }

    const freeEpisodesLimit = settingJSON.freeEpisodesForNonVip || 2;

    let remainingEpisodes = await ShortVideo.find({
      movieSeries: movieSeriesId,
      episodeNumber: { $gt: 0 }, // Exclude trailer
    })
      .sort("episodeNumber")
      .select("_id episodeNumber coin isLocked videoImage videoUrl")
      .lean();

    let freeEpisodes = remainingEpisodes.filter((ep) => ep.coin === 0); // Free episodes
    let paidEpisodes = remainingEpisodes.filter((ep) => ep.coin > 0); // Paid episodes

    freeEpisodes = freeEpisodes.slice(0, freeEpisodesLimit);
    remainingEpisodes = [...freeEpisodes, ...paidEpisodes];

    const episodeIndex = remainingEpisodes.findIndex((e) => e._id.toString() === shortVideoId.toString());
    const episodeToMoveObj = remainingEpisodes[episodeIndex];

    remainingEpisodes.splice(episodeIndex, 1);
    remainingEpisodes.splice(newEpisodePosition - 1, 0, episodeToMoveObj);

    for (let i = 0; i < remainingEpisodes.length; i++) {
      const newEpisodeNumber = i + 1;
      const isLocked = newEpisodeNumber > freeEpisodesLimit;
      const coin = isLocked ? (remainingEpisodes[i].coin === 0 ? 10 : remainingEpisodes[i].coin) : 0;

      await ShortVideo.findByIdAndUpdate(remainingEpisodes[i]._id, {
        isLocked,
        coin,
        episodeNumber: newEpisodeNumber,
        videoImage: remainingEpisodes[i].videoImage,
        videoUrl: remainingEpisodes[i].videoUrl,
      });
    }

    return res.status(200).json({
      status: true,
      message: "ShortVideo updated successfully, and episode positions preserved correctly.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
