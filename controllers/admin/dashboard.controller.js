const User = require("../../models/user.model");
const Category = require("../../models/category.model");
const MovieSeries = require("../../models/movieSeries.model");
const ShortVideo = require("../../models/shortVideo.model");
const WithdrawRequest = require("../../models/withDrawRequest.model");
const VipPlanHistory = require("../../models/vipPlanHistory.model");
const CoinPlanHistory = require("../../models/coinplanHistory.model");

//get dashboard count
exports.dashboardCount = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
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

    const [totalUsers, totalCategory, totalMovieSeries, totalShortVideos, totalWithdrawRequests, vipRevenue, coinRevenue] = await Promise.all([
      User.countDocuments(dateFilterQuery),
      Category.countDocuments(dateFilterQuery),
      MovieSeries.countDocuments(dateFilterQuery),
      ShortVideo.countDocuments(dateFilterQuery),
      WithdrawRequest.countDocuments(dateFilterQuery),
      VipPlanHistory.aggregate([
        {
          $match: dateFilterQuery,
        },
        {
          $group: { _id: null, total: { $sum: "$price" } },
        },
      ]),
      CoinPlanHistory.aggregate([
        {
          $match: dateFilterQuery,
        },
        {
          $group: { _id: null, total: { $sum: "$price" } },
        },
      ]),
    ]);

    const totalRevenue = (vipRevenue[0]?.total || 0) + (coinRevenue[0]?.total || 0);

    return res.status(200).json({
      status: true,
      message: "Retrieve dashboard count.",
      data: {
        totalUsers,
        totalCategory,
        totalMovieSeries,
        totalShortVideos,
        totalWithdrawRequests,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get date wise chartAnalytic for users, revenue
exports.chartAnalytic = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate || !req.query.type) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const type = req.query.type.trim().toLowerCase();
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

    if (type === "user") {
      const data = await User.aggregate([
        {
          $match: dateFilterQuery,
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return res.status(200).json({ status: true, message: "Success", chartAnalyticOfUsers: data });
    } else if (type === "revenue") {
      const [vipPlanRevenue, coinPlanRevenue] = await Promise.all([
        VipPlanHistory.aggregate([
          {
            $match: dateFilterQuery,
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 },
              price: { $sum: "$price" },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ]),
        CoinPlanHistory.aggregate([
          {
            $match: dateFilterQuery,
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 },
              price: { $sum: "$price" },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ]),
      ]);

      const data = [...vipPlanRevenue, ...coinPlanRevenue];

      return res.status(200).json({ status: true, message: "Success", chartAnalyticOfRevenue: data });
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
