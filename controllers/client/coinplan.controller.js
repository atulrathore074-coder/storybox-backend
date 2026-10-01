const CoinPlan = require("../../models/coinplan.model");

//import models
const User = require("../../models/user.model");
const History = require("../../models/history.model");
const CoinPlanHistory = require("../../models/coinplanHistory.model");

//mongoose
const mongoose = require("mongoose");

//moment
const moment = require("moment");

//generate OrderHistory UniqueId
const { generateOrderHistoryUniqueId } = require("../../util/generateOrderHistoryUniqueId");

//razorpay
const Razorpay = require("razorpay");

//get coinPlan
exports.fetchCoinplanByUser = async (req, res) => {
  try {
    const coinPlan = await CoinPlan.find({ isActive: true }).sort({ coin: 1, amount: 1 }).lean();

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

//when user purchase the coinPlan create coinPlan history by user
exports.recordCoinPlanHistory = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.coinPlanId || !req.query.paymentGateway) {
      return res.json({ status: false, message: "Oops ! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const coinPlanObjectId = new mongoose.Types.ObjectId(req.query.coinPlanId);
    const paymentGateWay = req.query.paymentGateway.trim();

    const [orderHistoryUniqueId, user, coinPlan] = await Promise.all([
      generateOrderHistoryUniqueId(),
      User.findOne({ _id: userId }).select("_id isBlock").lean(),
      CoinPlan.findOne({ _id: coinPlanObjectId }).lean(),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!coinPlan) {
      return res.status(200).json({ status: false, message: "CoinPlan does not found." });
    }

    const newCoinPlan = {
      coin: coinPlan.coin,
      bonusCoin: coinPlan?.bonusCoin || 0,
      price: coinPlan.price,
      offerPrice: coinPlan?.offerPrice || 0,
      purchasedAt: new Date(),
    };

    const totalCoins = coinPlan?.coin + coinPlan?.bonusCoin || 0;

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $inc: {
          coin: totalCoins,
          purchasedCoin: totalCoins,
        },
        $push: {
          coinplan: newCoinPlan,
        },
      },
      { new: true }
    );

    if (updatedUser) {
      console.log("User successfully purchased new coin plan");
    } else {
      console.error("User not found or update failed");
    }

    res.status(200).json({
      status: true,
      message: "When user purchase the coinPlan created coinPlan history!",
      userCoin: updatedUser?.coin || 0,
    });

    const coinplanPurHistory = new CoinPlanHistory();
    coinplanPurHistory.uniqueId = orderHistoryUniqueId;
    coinplanPurHistory.userId = user._id;
    coinplanPurHistory.coinplanId = coinPlan._id;
    coinplanPurHistory.coin = coinPlan?.coin || 0;
    coinplanPurHistory.bonusCoin = coinPlan?.bonusCoin || 0;
    coinplanPurHistory.price = coinPlan.price;
    coinplanPurHistory.offerPrice = coinPlan.offerPrice;
    coinplanPurHistory.paymentGateway = paymentGateWay;
    coinplanPurHistory.date = moment(moment().toISOString()).local().format("YYYY-MM-DD hh:mm:ss A"); //2024-11-11 04:45:30 PM;

    await Promise.all([
      coinplanPurHistory.save(),
      History.create({
        userId: user._id,
        coin: totalCoins,
        price: coinPlan?.price,
        offerPrice: coinPlan?.offerPrice,
        paymentGateway: paymentGateWay,
        uniqueId: orderHistoryUniqueId,
        type: 5,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }),
    ]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//purchase plan through stripe ( web )
exports.processStripePayment = async (req, res) => {
  try {
    console.log("Stripe Payment API initiated for web:", req.body);

    if (!req.user || !req.user.uid) {
      return res.status(401).json({ status: false, message: "Unauthorized access. Invalid token." });
    }

    const { coinPlanId, currency, billing_details, paymentGateway, payment_method_id } = req.body;

    if (!coinPlanId || !currency || !billing_details || !paymentGateway) {
      return res.status(200).json({ status: false, message: "Invalid request. Required details missing." });
    }

    const userUid = req.user.uid;
    const coinPlanObjectId = new mongoose.Types.ObjectId(coinPlanId);
    const trimmedGateway = paymentGateway.trim();

    const [orderHistoryUniqueId, user, coinPlan] = await Promise.all([
      generateOrderHistoryUniqueId(),
      User.findOne({ firebaseUid: userUid }).select("_id isBlock").lean(),
      CoinPlan.findOne({ _id: coinPlanObjectId }).lean(),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    if (!coinPlan) {
      return res.status(200).json({ status: false, message: "Coin plan not found." });
    }

    if (!settingJSON) {
      return res.status(200).json({ status: false, message: "Configuration settings not found." });
    }

    if (!payment_method_id) {
      return res.status(200).json({ status: false, message: "Payment method ID is required." });
    }

    console.log("Received payment_method_id:", payment_method_id);

    const stripe = require("stripe")(settingJSON?.stripeSecretKey);

    const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);
    if (!paymentMethod) {
      return res.status(200).json({ status: false, message: "Invalid payment method." });
    }

    const customer = await stripe.customers.create({
      email: billing_details.email,
      name: billing_details.name,
      address: {
        line1: billing_details?.address?.line1,
        line2: billing_details?.address?.line2,
        postal_code: billing_details?.address?.postal_code,
        city: billing_details?.address?.city,
        state: billing_details?.address?.state,
        country: billing_details?.address?.country,
      },
    });

    console.log("Stripe customer created:", customer);

    const finalPrice = coinPlan.offerPrice > 0 ? coinPlan.offerPrice : coinPlan.price;
    console.log("finalPrice ==============", finalPrice);

    if (currency === "inr" && finalPrice < 50) {
      return res.status(200).json({
        status: false,
        message: "Minimum transaction amount should be ₹50.",
      });
    }

    let intent = await stripe.paymentIntents.create({
      amount: currency === "inr" ? finalPrice * 100 : finalPrice * 100,
      currency,
      customer: customer.id,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      shipping: {
        name: billing_details.name,
        address: {
          line1: billing_details?.address?.line1,
          line2: billing_details?.address?.line2,
          postal_code: billing_details?.address?.postal_code,
          city: billing_details?.address?.city,
          state: billing_details?.address?.state,
          country: billing_details?.address?.country,
        },
      },
      payment_method: payment_method_id,
    });

    console.log("Stripe PaymentIntent created:", intent.id);

    intent = await stripe.paymentIntents.confirm(intent.id);
    console.log("PaymentIntent status after confirmation:", intent.status);

    if (intent.status === "requires_action" && intent.next_action.type === "use_stripe_sdk") {
      return res.status(200).json({
        status: true,
        requires_action: true,
        payment_intent_client_secret: intent.client_secret,
      });
    } else if (intent.status === "succeeded") {
      console.log("Payment successful");

      const newCoinPlan = {
        coin: coinPlan.coin,
        bonusCoin: coinPlan?.bonusCoin || 0,
        price: coinPlan.price,
        offerPrice: coinPlan?.offerPrice || 0,
        purchasedAt: new Date(),
      };

      const totalCoins = coinPlan?.coin + coinPlan?.bonusCoin || 0;

      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        {
          $inc: { coin: totalCoins, purchasedCoin: totalCoins },
          $push: { coinplan: newCoinPlan },
        },
        { new: true, lean: true }
      );

      res.status(200).json({
        status: true,
        message: "Payment successful, coins added to your account.",
        userCoin: updatedUser?.coin || 0,
        payment_intent_client_secret: intent.client_secret,
      });

      const coinPlanHistory = new CoinPlanHistory({
        uniqueId: orderHistoryUniqueId,
        userId: user._id,
        coinplanId: coinPlan._id,
        coin: coinPlan.coin || 0,
        bonusCoin: coinPlan.bonusCoin || 0,
        price: coinPlan.price,
        offerPrice: coinPlan.offerPrice,
        paymentGateway: trimmedGateway,
        date: moment().local().format("YYYY-MM-DD hh:mm:ss A"),
      });

      await Promise.all([
        coinPlanHistory.save(),
        History.create({
          userId: user._id,
          coin: totalCoins,
          price: coinPlan.price,
          offerPrice: coinPlan.offerPrice,
          paymentGateway: trimmedGateway,
          uniqueId: orderHistoryUniqueId,
          type: 5,
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        }),
      ]);
    } else {
      return res.status(200).json({
        status: false,
        message: "Payment failed. Invalid PaymentIntent status.",
      });
    }
  } catch (error) {
    console.error("Error in payment processing:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//integrate razorpay's order creation ( web )
exports.initiateUPIOrder = async (req, res) => {
  try {
    const { amount, currency = "inr", receipt } = req.body;

    if (!amount || !receipt) {
      return res.status(200).json({ status: false, message: "Amount and receipt are required" });
    }

    const razorpay = new Razorpay({
      key_id: settingJSON.razorPayId,
      key_secret: settingJSON.razorSecretKey,
    });

    const options = {
      amount: amount * 100, // Convert amount to the smallest unit
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      status: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Error in order creation:", error);

    const statusCode = error.statusCode || 500;
    const description = error.error?.description || error.message || "Internal Server Error";

    return res.status(statusCode).json({
      status: false,
      error: description,
      code: error.error?.code || "UNKNOWN_ERROR",
    });
  }
};
