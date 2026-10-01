//express
const express = require("express");
const route = express.Router();

//admin middleware
const AdminMiddleware = require("../../middleware/admin.middleware");

//controller
const AdminController = require("../../controllers/admin/admin.controller");

//admin signUp
route.post("/create", AdminController.store);

//admin login
route.post("/login", AdminController.login);

//get admin profile
route.get("/getProfile", AdminMiddleware, AdminController.getProfile);

//update admin profile
route.put("/updateProfile", AdminMiddleware, AdminController.updateProfile);

//send email for forgot the password (forgot password)
route.post("/forgotPassword", AdminController.forgotPassword);

//update admin password
route.put("/updatePassword", AdminMiddleware, AdminController.updatePassword);

//set password
route.post("/setPassword", AdminMiddleware, AdminController.setPassword);

//auto import playlist
route.post("/autoImportPlaylist", AdminMiddleware, AdminController.autoImportPlaylist);

module.exports = route;
