const express = require("express");
const route = express.Router();
const checkAccessWithSecretKey = require("../../checkAccess");
const WithdrawController = require("../../controllers/client/withdraw.controller");

// Get active withdraw methods (UPI, Paytm)
route.get("/getMethods", checkAccessWithSecretKey(), WithdrawController.getWithdrawMethods);

// Create withdrawal request
route.post("/create", checkAccessWithSecretKey(), WithdrawController.createWithdrawRequest);

// Get user's withdrawal history
route.get("/myRequests", checkAccessWithSecretKey(), WithdrawController.getMyWithdrawRequests);

module.exports = route;
