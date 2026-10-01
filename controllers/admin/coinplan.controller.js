const CoinPlan = require("../../models/coinplan.model");

//mongoose
const mongoose = require("mongoose");

//import model
const CoinPlanHistory = require("../../models/coinplanHistory.model");
const History = require("../../models/history.model");

//create coinplan
exports.store = async (req, res) => {
  try {
    if (!req.body.coin || !req.body.price || !req.body.productKey) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const { coin, bonusCoin, price, offerPrice, productKey } = req.body;

    const coinplan = new CoinPlan();
    coinplan.coin = coin;
    coinplan.bonusCoin = bonusCoin || 0;
    coinplan.price = price;
    coinplan.offerPrice = offerPrice || 0;
    coinplan.productKey = productKey;
    coinplan.icon = req.body.icon ? req.body.icon : "";
    await coinplan.save();

    return res.status(200).json({
      status: true,
      message: "coinplan create Successfully",
      data: coinplan,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//update coinplan
exports.update = async (req, res) => {
  try {
    if (!req.body.coinPlanId) {
      return res.status(200).json({ status: false, message: "coinPlanId must be needed." });
    }

    const coinplan = await CoinPlan.findById(req.body.coinPlanId);
    if (!coinplan) {
      return res.status(200).json({ status: false, message: "CoinPlan does not found." });
    }

    coinplan.coin = req.body.coin ? Number(req.body.coin) : coinplan.coin;
    coinplan.bonusCoin = req.body.bonusCoin ? Number(req.body.bonusCoin) : coinplan.bonusCoin;
    coinplan.price = req.body.price ? Number(req.body.price) : coinplan.price;
    coinplan.offerPrice = req.body.offerPrice ? Number(req.body.offerPrice) : coinplan.offerPrice;
    coinplan.productKey = req.body.productKey ? req.body.productKey : coinplan.productKey;

    await coinplan.save();

    return res.status(200).json({
      status: true,
      message: "Coinplan update Successfully",
      data: coinplan,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//handle isActive switch
exports.handleSwitch = async (req, res) => {
  try {
    if (!req.query.coinPlanId) {
      return res.status(200).json({ status: false, message: "coinPlanId must be needed." });
    }

    const coinplan = await CoinPlan.findById(req.query.coinPlanId);
    if (!coinplan) {
      return res.status(200).json({ status: false, message: "CoinPlan does not found." });
    }

    coinplan.isActive = !coinplan.isActive;
    await coinplan.save();

    return res.status(200).json({ status: true, message: "Success", data: coinplan });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get coinPlan
exports.get = async (req, res) => {
  try {
    const coinPlan = await CoinPlan.find().sort({ coin: 1, amount: 1 }).lean();

    return res.status(200).json({
      status: true,
      message: "Retrive CoinPlan Successfully",
      data: coinPlan,
    });
  } catch {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//delete coinplan
exports.delete = async (req, res) => {
  try {
    if (!req.query.coinPlanId) {
      return res.status(200).json({ status: false, message: "coinPlanId must be needed." });
    }

    const coinplan = await CoinPlan.findById(req.query.coinPlanId);
    if (!coinplan) {
      return res.status(200).json({ status: false, message: "CoinPlan does not found." });
    }

    await coinplan.deleteOne();

    return res.status(200).json({
      status: true,
      message: "Coinplan deleted Successfully",
      data: coinplan,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//get user's coinplan order histories
exports.fetchCoinplanHistory = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    let dateFilterQuery = {};
    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    if (req.query.userId) {
      dateFilterQuery.userId = new mongoose.Types.ObjectId(req.query.userId);
    }

    const [adminEarnings, history] = await Promise.all([
      History.aggregate([
        {
          $match: {
            ...dateFilterQuery,
            type: 5,
            price: { $exists: true, $ne: 0 },
          },
        },
        { $group: { _id: null, totalEarnings: { $sum: "$price" } } },
      ]),
      History.aggregate([
        {
          $match: {
            ...dateFilterQuery,
            type: 5,
            price: { $exists: true, $ne: 0 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $group: {
            _id: "$user._id",
            name: { $first: "$user.name" },
            username: { $first: "$user.username" },
            totalPlansPurchased: { $sum: 1 },
            totalAmountSpent: { $sum: "$price" },
            coinPlanPurchase: {
              $push: {
                coin: "$coin",
                uniqueId: "$uniqueId",
                paymentGateway: "$paymentGateway",
                price: "$price",
                date: "$date",
              },
            },
          },
        },
        { $sort: { totalPlansPurchased: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    const totalAdminEarnings = adminEarnings.length > 0 ? adminEarnings[0].totalEarnings : 0;

    return res.status(200).json({
      status: true,
      message: "Success",
      totalHistory: history.length,
      totalAdminEarnings: totalAdminEarnings,
      history: history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
