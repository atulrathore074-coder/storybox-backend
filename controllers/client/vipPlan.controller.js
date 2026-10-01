const VipPlan = require("../../models/vipPlan.model");

//import model
const User = require("../../models/user.model");
const VipPlanHistory = require("../../models/vipPlanHistory.model");

//generate OrderHistory UniqueId
const { generateOrderHistoryUniqueId } = require("../../util/generateOrderHistoryUniqueId");

//mongoose
const mongoose = require("mongoose");

//moment
const moment = require("moment");

//get vipPlan for user (isActive)
exports.fetchVipPlanByUser = async (req, res) => {
  try {
    const vipPlan = await VipPlan.find({ isActive: true }).sort({ validityType: 1, validity: 1 });

    return res.status(200).json({ status: true, message: "Success", vipPlan });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//when user purchase the vipPlan create vipPlan history by user
exports.recordVipPlanHistory = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.vipPlanId || !req.query.paymentGateway) {
      return res.json({ status: false, message: "Oops ! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const vipPlanId = new mongoose.Types.ObjectId(req.query.vipPlanId);
    const paymentGateWay = req.query.paymentGateway.trim();

    const [orderHistoryUniqueId, user, vipPlan] = await Promise.all([generateOrderHistoryUniqueId(), User.findOne({ _id: userId }), VipPlan.findById(vipPlanId)]);

    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!vipPlan) {
      return res.status(200).json({ status: false, message: "VipPlan does not found." });
    }

    res.status(200).json({
      status: true,
      message: "When user purchase the vipPlan created order history!",
    });

    const currentDate = new Date();

    let planEndDate = new Date(currentDate);

    if (vipPlan.validityType.toLowerCase() === "month") {
      planEndDate.setMonth(currentDate.getMonth() + vipPlan.validity);
    } else if (vipPlan.validityType.toLowerCase() === "year") {
      planEndDate.setFullYear(currentDate.getFullYear() + vipPlan.validity);
    }

    user.isVip = true;
    user.vipPlanStartDate = moment().toISOString();
    user.vipPlanEndDate = moment(planEndDate).toISOString();
    user.currentPlan.validity = vipPlan.validity;
    user.currentPlan.validityType = vipPlan.validityType;
    user.currentPlan.price = vipPlan.price;
    user.currentPlan.offerPrice = vipPlan.offerPrice;
    user.currentPlan.tags = vipPlan.tags;

    const orderHistory = new VipPlanHistory();
    orderHistory.uniqueId = orderHistoryUniqueId;
    orderHistory.userId = user._id;
    orderHistory.vipPlanId = vipPlan._id;
    orderHistory.price = vipPlan.price;
    orderHistory.offerPrice = vipPlan.offerPrice;
    orderHistory.paymentGateway = paymentGateWay;
    orderHistory.date = moment().toISOString();

    await Promise.all([user.save(), orderHistory.save()]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};