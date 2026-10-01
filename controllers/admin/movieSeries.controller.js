const MovieSeries = require("../../models/movieSeries.model");

//import model
const Category = require("../../models/category.model");
const ShortVideo = require("../../models/shortVideo.model");
const History = require("../../models/history.model");
const UserVideoList = require("../../models/userVideoList.model");
const WatchHistory = require("../../models/watchHistory.model");

//mongoose
const mongoose = require("mongoose");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

//create movie or webseries
exports.createContent = async (req, res) => {
  try {
    const { name, type, description, category, releaseDate, thumbnail, banner, maxAdsForFreeView } = req.body;

    if (!name || !type || !description || !category || !thumbnail || !banner || !maxAdsForFreeView) {
      await Promise.all([req.body.thumbnail && deleteFromStorage(req.body.thumbnail), req.body.banner && deleteFromStorage(req.body.banner)]);
      return res.status(200).json({ status: false, message: "Missing required fields." });
    }

    if (type !== 1 && type !== 2) {
      await Promise.all([req.body.thumbnail && deleteFromStorage(req.body.thumbnail), req.body.banner && deleteFromStorage(req.body.banner)]);
      return res.status(200).json({ status: false, message: "Invalid content type." });
    }

    const categoryId = new mongoose.Types.ObjectId(category);

    if (category) {
      const validCategory = await Category.findById(categoryId).select("_id").lean();

      if (!validCategory) {
        await Promise.all([req.body.thumbnail && deleteFromStorage(req.body.thumbnail), req.body.banner && deleteFromStorage(req.body.banner)]);
        return res.status(200).json({ status: false, message: "Category does not found." });
      }
    }

    const newContent = new MovieSeries({
      name,
      description,
      thumbnail,
      banner,
      type,
      category,
      maxAdsForFreeView: maxAdsForFreeView || 0,
      releaseDate: releaseDate || Date.now(),
    });

    await newContent.save();

    return res.status(200).json({
      status: true,
      message: "Content created successfully",
      data: newContent,
    });
  } catch (error) {
    await Promise.all([req.body.thumbnail && deleteFromStorage(req.body.thumbnail), req.body.banner && deleteFromStorage(req.body.banner)]);

    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//update movie or webseries
exports.updateContent = async (req, res) => {
  try {
    if (!req.body.movieWebseriesId) {
      await Promise.all([req.body.thumbnail && deleteFromStorage(req.body.thumbnail), req.body.banner && deleteFromStorage(req.body.banner)]);
      return res.status(200).json({ status: false, message: "movieWebseriesId must be re" });
    }

    const movieWebseriesId = new mongoose.Types.ObjectId(req.body.movieWebseriesId);

    const movieWebseries = await MovieSeries.findById(movieWebseriesId);
    if (!movieWebseries) {
      await Promise.all([req.body.thumbnail && deleteFromStorage(req.body.thumbnail), req.body.banner && deleteFromStorage(req.body.banner)]);
      return res.status(200).json({ status: false, message: "MovieSeries does not found." });
    }

    movieWebseries.name = req.body.name || movieWebseries.name;
    movieWebseries.maxAdsForFreeView = req.body.maxAdsForFreeView || movieWebseries.maxAdsForFreeView;
    movieWebseries.description = req.body.description || movieWebseries.description;

    if (req?.body?.thumbnail) {
      if (movieWebseries.thumbnail) {
        await deleteFromStorage(movieWebseries?.thumbnail);
      }

      movieWebseries.thumbnail = req.body.thumbnail ? req.body.thumbnail : movieWebseries.thumbnail;
    }

    if (req?.body?.banner) {
      if (movieWebseries?.banner) {
        await deleteFromStorage(movieWebseries?.banner);
      }

      movieWebseries.banner = req.body.banner ? req.body.banner : movieWebseries.banner;
    }

    if (req.body.category) {
      const categoryId = new mongoose.Types.ObjectId(req.body.category);

      const validCategory = await Category.findById(categoryId).select("_id").lean();
      if (!validCategory) {
        await Promise.all([req.body.thumbnail && deleteFromStorage(req.body.thumbnail), req.body.banner && deleteFromStorage(req.body.banner)]);
        return res.status(200).json({ status: false, message: "Category does not found." });
      }

      movieWebseries.category = validCategory._id || movieWebseries.category;
    }

    await movieWebseries.save();

    return res.status(200).json({
      status: true,
      message: "Content updated successfully",
      data: movieWebseries,
    });
  } catch (error) {
    await Promise.all([req.body.thumbnail && deleteFromStorage(req.body.thumbnail), req.body.banner && deleteFromStorage(req.body.banner)]);
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//toggle trending Status for Movie or Web Series
exports.toggleTrendingStatus = async (req, res) => {
  try {
    const { movieWebseriesId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(movieWebseriesId)) {
      return res.status(200).json({ status: false, message: "Invalid movieWebseries ID." });
    }

    const movieWebseries = await MovieSeries.findById(movieWebseriesId);
    if (!movieWebseries) {
      return res.status(200).json({ status: false, message: "Movie or web series not found." });
    }

    movieWebseries.isTrending = !movieWebseries.isTrending;
    await movieWebseries.save();

    return res.status(200).json({
      status: true,
      message: `Trending status has been ${movieWebseries.isTrending ? "enabled" : "disabled"} successfully.`,
      data: movieWebseries,
    });
  } catch (error) {
    console.error("Error toggling trending status:", error);
    return res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

//handle banner is auto-animated
exports.toggleAutoAnimateBanner = async (req, res) => {
  try {
    if (!req.query.movieWebseriesId) {
      return res.status(200).json({ status: false, message: "The 'movieWebseriesId' field is required." });
    }

    const movieWebseriesId = new mongoose.Types.ObjectId(req.query.movieWebseriesId);

    const movieWebseries = await MovieSeries.findById(movieWebseriesId);
    if (!movieWebseries) {
      return res.status(200).json({ status: false, message: "Movie or web series not found.." });
    }

    movieWebseries.isAutoAnimateBanner = !movieWebseries.isAutoAnimateBanner;
    await movieWebseries.save();

    return res.status(200).json({ status: true, message: `The Movie or web series has been updated successfully.`, data: movieWebseries });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//toggle active Status for Movie or Web Series
exports.toggleActiveStatus = async (req, res) => {
  try {
    const { movieWebseriesId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(movieWebseriesId)) {
      return res.status(200).json({ status: false, message: "Invalid movieWebseries ID." });
    }

    const movieWebseries = await MovieSeries.findById(movieWebseriesId);
    if (!movieWebseries) {
      return res.status(200).json({ status: false, message: "Movie or web series not found." });
    }

    movieWebseries.isActive = !movieWebseries.isActive;
    await movieWebseries.save();

    return res.status(200).json({
      status: true,
      message: `Active status has been ${movieWebseries.isActive ? "enabled" : "disabled"} successfully.`,
      data: movieWebseries,
    });
  } catch (error) {
    console.error("Error toggling active status:", error);
    return res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

//fetch movie or webseries
exports.fetchAllMediaContent = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const [totalMovieSeries, movieWebseries] = await Promise.all([
      MovieSeries.countDocuments(),
      MovieSeries.aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: "shortvideos",
            localField: "_id",
            foreignField: "movieSeries",
            as: "shortVideos",
          },
        },
        {
          $addFields: {
            totalShortVideos: { $size: "$shortVideos" },
          },
        },
        {
          $project: {
            shortVideos: 0,
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            type: 1,
            name: 1,
            description: 1,
            thumbnail: 1,
            banner: 1,
            isTrending: 1,
            isAutoAnimateBanner: 1,
            isActive: 1,
            releaseDate: 1,
            totalShortVideos: 1,
            maxAdsForFreeView: 1,
            categoryId: "$category._id",
            category: "$category.name",
          },
        },
      ]),
    ]);

    return res.status(200).json({ status: true, message: "Success", total: totalMovieSeries, data: movieWebseries });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//delete movie or webseries
exports.removeMovieSeries = async (req, res) => {
  try {
    const { movieWebseriesId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(movieWebseriesId)) {
      return res.status(200).json({ status: false, message: "Invalid movieWebseries ID." });
    }

    const [movieWebseries, shortVideos] = await Promise.all([
      MovieSeries.findById(movieWebseriesId).lean().select("_id thumbnail banner"),
      ShortVideo.find({ movieSeries: movieWebseriesId }).lean().select("_id videoImage videoUrl"),
    ]);

    if (!movieWebseries) {
      return res.status(200).json({ status: false, message: "Movie or web series not found." });
    }

    res.status(200).json({
      status: true,
      message: "Movie/Web series and associated short videos deleted successfully.",
    });

    for (const shortVideo of shortVideos) {
      await Promise.all([
        shortVideo.videoImage ? deleteFromStorage(shortVideo.videoImage) : null,
        shortVideo.videoUrl ? deleteFromStorage(shortVideo.videoUrl) : null,
        ShortVideo.deleteOne({ _id: shortVideo._id }),
      ]);
    }

    await Promise.all([
      ShortVideo.deleteMany({ movieSeries: movieWebseries._id }),
      History.deleteMany({ movieSeries: movieWebseries._id }),
      UserVideoList.deleteMany({ "videos.movieSeries": movieWebseries._id }),
      WatchHistory.deleteMany({ movieSeries: movieWebseries._id }),
    ]);

    await Promise.all([
      movieWebseries.thumbnail ? deleteFromStorage(movieWebseries.thumbnail) : null,
      movieWebseries.banner ? deleteFromStorage(movieWebseries.banner) : null,
      MovieSeries.deleteOne({ _id: movieWebseries._id }),
    ]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
