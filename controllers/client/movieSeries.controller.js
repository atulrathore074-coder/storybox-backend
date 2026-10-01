const MovieSeries = require("../../models/movieSeries.model");

//import model
const Category = require("../../models/category.model");
const User = require("../../models/user.model");

//mongoose
const mongoose = require("mongoose");

//get movies or series (New Release) (home)
exports.fetchNewReleasesForUser = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, videos] = await Promise.all([
      User.findOne({ _id: userId }).select("isBlock").lean(),
      MovieSeries.aggregate([
        {
          $match: { isActive: true },
        },
        {
          $lookup: {
            from: "watchhistories",
            localField: "_id",
            foreignField: "movieSeries",
            as: "watchHistories",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            thumbnail: 1,
            totalViews: {
              $size: "$watchHistories", // Total number of views for all videos in this movie series
            },
          },
        },
        { $sort: { releaseDate: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    return res.status(200).json({ status: true, message: "Retrieved new release data for the user.", videos: videos });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//contain categories with their respective movies or series (home)
exports.getMoviesGroupedByCategory = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be requried!" });
    }

    // const start = req.query.start ? parseInt(req.query.start) : 1;
    // const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const moviesStart = req.query.moviesStart ? parseInt(req.query.moviesStart) : 1;
    const moviesLimit = req.query.moviesLimit ? parseInt(req.query.moviesLimit) : 10;
    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, categoryIds] = await Promise.all([
      User.findOne({ _id: userId }).select("isBlock").lean(), //
      Category.find().limit(5).distinct("_id").lean(),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    const groupedMovies = await MovieSeries.aggregate([
      {
        $match: { isActive: true, category: { $in: categoryIds } },
      },
      {
        $lookup: {
          from: "watchhistories",
          localField: "_id",
          foreignField: "movieSeries",
          as: "watchHistories",
        },
      },
      {
        $group: {
          _id: "$category",
          movies: {
            $push: {
              _id: "$_id",
              name: "$name",
              thumbnail: "$thumbnail",
              totalViews: { $size: "$watchHistories" }, // Count views for each movie
            },
          },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: 0, // Exclude ID
          categoryName: "$category.name",
          movies: {
            $slice: ["$movies", (moviesStart - 1) * moviesLimit, moviesLimit],
          },
        },
      },
      // { $skip: (start - 1) * limit },
      // { $limit: limit },
    ]);

    return res.status(200).json({
      status: true,
      message: "Movies grouped by category fetched successfully.",
      groupedMovies: groupedMovies,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//fetch all movies or web series that are trending (home)
exports.getTrendingMoviesSeries = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const trendingItems = await MovieSeries.find({ isActive: true, isTrending: true })
      .select("name thumbnail description")
      .populate("category", "name")
      .skip((start - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      status: true,
      message: "Trending movies or web series retrieved successfully.",
      data: trendingItems,
    });
  } catch (error) {
    console.error("Error fetching trending movies or web series:", error);
    return res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

//fetch movies or web series (home - banner is auto-animated) (client / web )
exports.fetchMoviesSeries = async (req, res) => {
  try {
    const movieSeries = await MovieSeries.find({ isActive: true, isAutoAnimateBanner: true }).select("thumbnail banner name").lean();

    return res.status(200).json({
      status: true,
      message: "Movies or web series retrieved successfully.",
      data: movieSeries,
    });
  } catch (error) {
    console.error("Error fetching Movies or web series:", error);
    return res.status(500).json({ status: false, error: "Internal Server Error" });
  }
};

//search media content
exports.findContentBySearch = async (req, res) => {
  try {
    const { searchString, userId } = req.query;

    if (!searchString) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const searchQuery = searchString.trim() || "All";
    const matchStage = { isActive: true };

    if (searchQuery !== "All") {
      matchStage.$or = [{ name: { $regex: searchQuery, $options: "i" } }, { description: { $regex: searchQuery, $options: "i" } }];
    }

    const userQuery = userId ? User.findOne({ _id: userId }).select("isBlock") : Promise.resolve(null);

    const moviesQuery = MovieSeries.aggregate([
      {
        $match: matchStage,
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
          name: 1,
          description: 1,
          thumbnail: 1,
          isActive: 1,
          releaseDate: 1,
          categoryId: "$category._id",
          category: "$category.name",
        },
      },
    ]);

    const [user, response] = await Promise.all([userQuery, moviesQuery]);

    if (userId) {
      if (!user) {
        return res.status(200).json({ status: false, message: "User does not found." });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by admin." });
      }
    }

    return res.status(200).json({ status: true, message: "Success", searchData: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get movies or series (New Release) (home) (web)
exports.fetchLatestContentForUser = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    if (req.query.userId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.userId)) {
        return res.status(200).json({
          status: false,
          message: "Invalid userId format. It must be a valid ObjectId.",
        });
      }

      const userId = new mongoose.Types.ObjectId(req.query.userId);

      const [user, videos] = await Promise.all([
        User.findOne({ _id: userId }).select("_id isBlock").lean(),
        MovieSeries.aggregate([
          {
            $match: { isActive: true },
          },
          {
            $lookup: {
              from: "uservideolists",
              let: { movieSeriesId: "$_id" },
              pipeline: [
                {
                  $match: {
                    userId: userId,
                    $expr: {
                      $in: ["$$movieSeriesId", "$videos.movieSeries"],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                  },
                },
              ],
              as: "userVideoList",
            },
          },
          {
            $addFields: {
              isAddedToList: { $gt: [{ $size: "$userVideoList" }, 0] },
            },
          },
          {
            $project: {
              _id: 1,
              releaseDate: 1,
              name: 1,
              description: 1,
              thumbnail: 1,
              isAddedToList: 1,
            },
          },
          { $sort: { releaseDate: -1 } },
          { $skip: (start - 1) * limit },
          { $limit: limit },
        ]),
      ]);

      if (!user) {
        return res.status(200).json({ status: false, message: "User not found." });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by the admin." });
      }

      return res.status(200).json({ status: true, message: "Retrieved the latest new releases.", videos });
    } else {
      const videos = await MovieSeries.aggregate([
        {
          $match: { isActive: true },
        },
        {
          $addFields: {
            isAddedToList: false,
          },
        },
        {
          $project: {
            _id: 1,
            releaseDate: 1,
            name: 1,
            description: 1,
            thumbnail: 1,
            isAddedToList: 1,
          },
        },
        { $sort: { releaseDate: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]);

      return res.status(200).json({ status: true, message: "Retrieved the latest new releases.", videos });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//contain categories with their respective movies or series (home) (web)
exports.fetchMoviesGroupedByGenre = async (req, res) => {
  try {
    const moviesStart = req.query.moviesStart ? parseInt(req.query.moviesStart) : 1;
    const moviesLimit = req.query.moviesLimit ? parseInt(req.query.moviesLimit) : 10;
    const userId = req.query.userId ? new mongoose.Types.ObjectId(req.query.userId) : null;

    const [categoryIds, user] = await Promise.all([Category.find().limit(8).distinct("_id").lean(), userId ? User.findOne({ _id: userId }).select("isBlock").lean() : null]);

    if (userId) {
      if (!user) {
        return res.status(200).json({ status: false, message: "User not found." });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by the admin." });
      }
    }

    const groupedMovies = await MovieSeries.aggregate([
      { $match: { isActive: true, category: { $in: categoryIds } } },
      {
        $lookup: {
          from: "uservideolists",
          let: { movieId: "$_id" },
          pipeline: [{ $match: { userId: userId } }, { $unwind: "$videos" }, { $match: { $expr: { $eq: ["$videos.movieSeries", "$$movieId"] } } }, { $project: { _id: 1 } }],
          as: "userVideo",
        },
      },
      {
        $group: {
          _id: "$category",
          movies: {
            $push: {
              _id: "$_id",
              name: "$name",
              description: "$description",
              thumbnail: "$thumbnail",
              isAddedToList: { $gt: [{ $size: "$userVideo" }, 0] }, // true if movie exists in UserVideoList
            },
          },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          categoryName: "$category.name",
          movies: { $slice: ["$movies", (moviesStart - 1) * moviesLimit, moviesLimit] },
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Movies grouped by category fetched successfully.",
      groupedMovies,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//fetch movies or web series (more recommended) (web)
exports.fetchMediaCollection = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const userId = req.query.userId ? new mongoose.Types.ObjectId(req.query.userId) : null;

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({
        status: false,
        message: "Invalid userId format. It must be a valid ObjectId.",
      });
    }

    const userQuery = userId ? User.findOne({ _id: userId }).select("isBlock") : Promise.resolve(null);

    const moviesQuery = MovieSeries.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "watchhistories",
          localField: "_id",
          foreignField: "movieSeries",
          as: "watchData",
        },
      },
      {
        $addFields: {
          views: { $size: "$watchData" },
        },
      },
      ...(userId
        ? [
            {
              $lookup: {
                from: "uservideolists",
                let: { movieSeriesId: "$_id" },
                pipeline: [
                  { $match: { userId: userId } },
                  {
                    $project: {
                      isAddedToList: {
                        $in: ["$$movieSeriesId", "$videos.movieSeries"],
                      },
                    },
                  },
                ],
                as: "userVideoList",
              },
            },
            {
              $set: {
                isAddedToList: {
                  $cond: {
                    if: { $gt: [{ $size: "$userVideoList" }, 0] },
                    then: { $arrayElemAt: ["$userVideoList.isAddedToList", 0] },
                    else: false,
                  },
                },
              },
            },
            { $unset: "userVideoList" },
          ]
        : [
            {
              $set: {
                isAddedToList: false,
              },
            },
          ]),
      {
        $project: {
          _id: 1,
          releaseDate: 1,
          name: 1,
          description: 1,
          thumbnail: 1,
          isAddedToList: 1,
          category: "$category.name",
          views: 1,
        },
      },
      { $sort: { views: -1, isTrending: -1, releaseDate: -1 } }, // Sort first by views, then by isTrending, then by releaseDate
      { $skip: (start - 1) * limit },
      { $limit: limit },
    ]);

    const [user, videos] = await Promise.all([userQuery, moviesQuery]);

    if (userId) {
      if (!user) {
        return res.status(200).json({ status: false, message: "User not found." });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by the admin." });
      }
    }

    return res.status(200).json({
      status: true,
      message: "Here are some recommended videos for you!",
      videos,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//search media content (web)
exports.getContentBySearch = async (req, res) => {
  try {
    const { searchString, userId } = req.query;

    if (!searchString) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const searchQuery = searchString.trim() || "All";
    const matchStage = { isActive: true };

    if (searchQuery !== "All") {
      matchStage.$or = [{ name: { $regex: searchQuery, $options: "i" } }, { description: { $regex: searchQuery, $options: "i" } }];
    }

    if (userId) {
      if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(200).json({
          status: false,
          message: "Invalid userId format. It must be a valid ObjectId.",
        });
      }
    }

    const userQuery = userId ? User.findOne({ _id: userId }).select("isBlock") : Promise.resolve(null);

    const moviesQuery = MovieSeries.aggregate([
      {
        $match: matchStage,
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
        $lookup: {
          from: "watchhistories",
          localField: "_id",
          foreignField: "movieSeries",
          as: "watchData",
        },
      },
      {
        $addFields: {
          views: { $size: "$watchData" },
        },
      },
      ...(userId
        ? [
            {
              $lookup: {
                from: "uservideolists",
                let: { movieSeriesId: "$_id" },
                pipeline: [
                  { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                  {
                    $project: {
                      isAddedToList: {
                        $in: ["$$movieSeriesId", "$videos.movieSeries"],
                      },
                    },
                  },
                ],
                as: "userVideoList",
              },
            },
            {
              $set: {
                isAddedToList: {
                  $cond: {
                    if: { $gt: [{ $size: "$userVideoList" }, 0] },
                    then: { $arrayElemAt: ["$userVideoList.isAddedToList", 0] },
                    else: false,
                  },
                },
              },
            },
            { $unset: "userVideoList" },
          ]
        : [
            {
              $set: {
                isAddedToList: false,
              },
            },
          ]),
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          thumbnail: 1,
          releaseDate: 1,
          category: "$category.name",
          isAddedToList: 1,
          views: 1,
        },
      },
      { $sort: { views: -1, releaseDate: -1 } },
    ]);

    const [user, videos] = await Promise.all([userQuery, moviesQuery]);

    if (userId) {
      if (!user) {
        return res.status(200).json({ status: false, message: "User not found." });
      }

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by the admin." });
      }
    }

    return res.status(200).json({
      status: true,
      message: "Success",
      searchData: videos,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
