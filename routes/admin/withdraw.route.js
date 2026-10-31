const express = require("express");
const route = express.Router();
const WithdrawController = require("../../controllers/admin/withdraw.controller");

// ─── Withdrawal Requests ───────────────────────────────────────────────────
// GET all withdrawal requests  (optional ?status=1|2|3  &page=1&limit=20)
route.get("/getAll", WithdrawController.getAllWithdrawRequests);

// APPROVE a request
route.patch("/approve/:id", WithdrawController.approveWithdrawRequest);

// DECLINE a request (coins refunded)
route.patch("/decline/:id", WithdrawController.declineWithdrawRequest);

// ─── Withdraw Methods (UPI / Paytm) ───────────────────────────────────────
route.get("/methods", WithdrawController.getWithdrawMethods);
route.post("/methods/create", WithdrawController.createWithdrawMethod);
route.patch("/methods/update/:id", WithdrawController.updateWithdrawMethod);
route.delete("/methods/delete/:id", WithdrawController.deleteWithdrawMethod);

module.exports = route;
