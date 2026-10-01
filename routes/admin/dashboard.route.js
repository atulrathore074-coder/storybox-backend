const express = require("express");
const route = express.Router();

//Controller
const dashboardController = require("../../controllers/admin/dashboard.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//get dashboard count
route.get("/dashboardCount", checkAccessWithSecretKey(), dashboardController.dashboardCount);

//get date wise chartAnalytic for users, revenue
route.get("/chartAnalytic", checkAccessWithSecretKey(), dashboardController.chartAnalytic);

module.exports = route;
