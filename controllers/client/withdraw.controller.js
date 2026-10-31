const WithdrawRequest = require("../../models/withDrawRequest.model");
const WithdrawMethod = require("../../models/withdrawMethod.model");
const User = require("../../models/user.model");
const { generateHistoryUniqueId } = require("../../util/generateHistoryUniqueId");

// ─── GET all active withdraw methods (UPI, Paytm, etc.) ────────────────────
exports.getWithdrawMethods = async (req, res) => {
  try {
    const methods = await WithdrawMethod.find({ isEnabled: true }).sort({ createdAt: -1 });
    return res.status(200).json({ status: true, message: "Withdraw methods fetched.", data: methods });
  } catch (error) {
    console.error("getWithdrawMethods:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ─── CREATE a new withdrawal request ───────────────────────────────────────
exports.createWithdrawRequest = async (req, res) => {
  try {
    const { userId, coin, paymentGateway, paymentDetails } = req.body;

    if (!userId || !coin || !paymentGateway || !paymentDetails) {
      return res.status(200).json({ status: false, message: "All fields are required." });
    }

    const coinAmount = parseInt(coin, 10);
    if (isNaN(coinAmount) || coinAmount <= 0) {
      return res.status(200).json({ status: false, message: "Invalid coin amount." });
    }

    // Min withdrawal check from settings
    const minCoin = (global.settingJSON && global.settingJSON.minWithdrawalRequestedCoin) || 1000;
    if (coinAmount < minCoin) {
      return res.status(200).json({
        status: false,
        message: `Minimum ${minCoin} coins required for withdrawal.`,
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(200).json({ status: false, message: "User not found." });
    if (user.isBlock) return res.status(200).json({ status: false, message: "You are blocked by admin." });

    // Check available coin balance
    const availableCoins = user.coin || 0;
    if (availableCoins < coinAmount) {
      return res.status(200).json({
        status: false,
        message: `Insufficient coins. You have ${availableCoins} coins. Minimum needed is ${coinAmount}.`,
      });
    }

    // Convert coins to amount: 100 coins = ₹1 -> 1000 coins = ₹10
    const coinConversionRate = (global.settingJSON && global.settingJSON.minCoinForCashOut) || 100;
    const amount = coinAmount / coinConversionRate;

    const uniqueId = await generateHistoryUniqueId("WD");

    // Deduct coins from user balance
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        coin: -coinAmount,
        rewardCoin: -Math.min(user.rewardCoin || 0, coinAmount)
      },
    });

    const request = await WithdrawRequest.create({
      userId,
      amount,
      coin: coinAmount,
      paymentGateway,
      paymentDetails,
      uniqueId,
      status: 1, // PENDING
      requestDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    });

    return res.status(200).json({
      status: true,
      message: "Withdrawal request submitted successfully! Admin will process it via UPI within 24-48 hours.",
      data: request,
    });
  } catch (error) {
    console.error("createWithdrawRequest:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ─── GET user's withdrawal history ────────────────────────────────────────
exports.getMyWithdrawRequests = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(200).json({ status: false, message: "userId is required." });

    const requests = await WithdrawRequest.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ status: true, message: "Withdrawal history fetched.", data: requests });
  } catch (error) {
    console.error("getMyWithdrawRequests:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
