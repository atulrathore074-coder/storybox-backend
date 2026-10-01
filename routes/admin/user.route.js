//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

//controller
const UserController = require("../../controllers/admin/user.controller");

//update userInfo
route.put("/modifyUserInfo", checkAccessWithSecretKey(), UserController.modifyUserInfo);

//handle block of the user
route.put("/isBlock", checkAccessWithSecretKey(), UserController.isBlock);

//get user profile
route.get("/retriveUserProfile", checkAccessWithSecretKey(), UserController.retriveUserProfile);

//get all users
route.get("/getUsersByAdmin", checkAccessWithSecretKey(), UserController.getUsersByAdmin);

//delete user
route.delete("/deactivateUser", checkAccessWithSecretKey(), UserController.deactivateUser);

module.exports = route;
