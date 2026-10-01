const mongoose = require("mongoose");

const vipPlanHistorySchema = new mongoose.Schema(
  {
    uniqueId: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    vipPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "VipPlan", default: null },
    price: { type: Number, default: 0 },
    offerPrice: { type: Number, default: 0 },
    paymentGateway: { type: String, default: "" },
    date: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

vipPlanHistorySchema.index({ vipPlanId: 1 });
vipPlanHistorySchema.index({ userId: 1 });

module.exports = mongoose.model("VipPlanHistory", vipPlanHistorySchema);
