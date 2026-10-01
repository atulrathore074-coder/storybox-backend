const express = require("express");
const route = express.Router();

//Controller
const coinplanController = require("../../controllers/admin/coinplan.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//create coinplan
route.post("/store", checkAccessWithSecretKey(), coinplanController.store);

//update coinplan
route.put("/update", checkAccessWithSecretKey(), coinplanController.update);

//handle isActive switch
route.put("/handleSwitch", checkAccessWithSecretKey(), coinplanController.handleSwitch);

//delete coinplan
route.delete("/delete", checkAccessWithSecretKey(), coinplanController.delete);

//get coinplan
route.get("/get", checkAccessWithSecretKey(), coinplanController.get);

//get user's coinplan order histories
route.get("/fetchCoinplanHistory", checkAccessWithSecretKey(), coinplanController.fetchCoinplanHistory);

module.exports = route;
