//express
const express = require("express");
const route = express.Router();

//controller
const settingController = require("../../controllers/admin/setting.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//get setting
route.get("/fetchSettingByAdmin", checkAccessWithSecretKey(), settingController.fetchSettingByAdmin);

//update setting
route.put("/updateSetting", checkAccessWithSecretKey(), settingController.updateSetting);

//handle activation of the switch
route.put("/handleSwitch", checkAccessWithSecretKey(), settingController.handleSwitch);

//handle update storage
route.put("/handleStorageSwitch", checkAccessWithSecretKey(), settingController.handleStorageSwitch);

module.exports = route;
