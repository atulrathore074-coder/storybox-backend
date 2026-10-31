const WithdrawRequest = require("../../models/withDrawRequest.model");
const WithdrawMethod = require("../../models/withdrawMethod.model");
const User = require("../../models/user.model");

// ─── GET all withdrawal requests (paginated) ──────────────────────────────
exports.getAllWithdrawRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status ? parseInt(req.query.status) : null;

    const filter = status ? { status } : {};

    const [requests, total] = await Promise.all([
      WithdrawRequest.find(filter)
        .populate("userId", "name email mobileNumber uniqueId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WithdrawRequest.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: true,
      message: "Withdrawal requests fetched.",
      data: requests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("getAllWithdrawRequests:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ─── APPROVE a withdrawal request ─────────────────────────────────────────
exports.approveWithdrawRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await WithdrawRequest.findById(id);
    if (!request) return res.status(200).json({ status: false, message: "Request not found." });
    if (request.status !== 1) {
      return res.status(200).json({ status: false, message: "Request already processed." });
    }

    request.status = 2; // ACCEPTED
    request.acceptOrDeclineDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await request.save();

    return res.status(200).json({ status: true, message: "Withdrawal approved and marked as paid.", data: request });
  } catch (error) {
    console.error("approveWithdrawRequest:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ─── DECLINE a withdrawal request (coins refunded) ────────────────────────
exports.declineWithdrawRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const request = await WithdrawRequest.findById(id);
    if (!request) return res.status(200).json({ status: false, message: "Request not found." });
    if (request.status !== 1) {
      return res.status(200).json({ status: false, message: "Request already processed." });
    }

    // Refund coins to user
    await User.findByIdAndUpdate(request.userId, {
      $inc: { coin: request.coin, rewardCoin: request.coin },
    });

    request.status = 3; // DECLINE
    request.reason = reason || "Declined by admin.";
    request.acceptOrDeclineDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await request.save();

    return res.status(200).json({
      status: true,
      message: "Withdrawal declined. Coins have been refunded to user.",
      data: request,
    });
  } catch (error) {
    console.error("declineWithdrawRequest:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ─── GET withdrawal methods (admin manage) ────────────────────────────────
exports.getWithdrawMethods = async (req, res) => {
  try {
    const methods = await WithdrawMethod.find().sort({ createdAt: -1 });
    return res.status(200).json({ status: true, message: "Methods fetched.", data: methods });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ─── CREATE withdraw method ────────────────────────────────────────────────
exports.createWithdrawMethod = async (req, res) => {
  try {
    const { name, image, details } = req.body;
    if (!name) return res.status(200).json({ status: false, message: "Method name is required." });

    const method = await WithdrawMethod.create({ name, image: image || "", details: details || [] });
    return res.status(200).json({ status: true, message: "Withdraw method created.", data: method });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ─── UPDATE withdraw method ────────────────────────────────────────────────
exports.updateWithdrawMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const method = await WithdrawMethod.findByIdAndUpdate(id, req.body, { new: true });
    if (!method) return res.status(200).json({ status: false, message: "Method not found." });
    return res.status(200).json({ status: true, message: "Method updated.", data: method });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ─── DELETE withdraw method ────────────────────────────────────────────────
exports.deleteWithdrawMethod = async (req, res) => {
  try {
    const { id } = req.params;
    await WithdrawMethod.findByIdAndDelete(id);
    return res.status(200).json({ status: true, message: "Method deleted." });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
