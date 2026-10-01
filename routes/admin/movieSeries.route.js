const express = require("express");
const route = express.Router();

const MovieSeriesController = require("../../controllers/admin/movieSeries.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//create movie or webseries
route.post("/createContent", checkAccessWithSecretKey(), MovieSeriesController.createContent);

//update movie or webseries
route.put("/updateContent", checkAccessWithSecretKey(), MovieSeriesController.updateContent);

//fetch movie or webseries
route.get("/fetchAllMediaContent", checkAccessWithSecretKey(), MovieSeriesController.fetchAllMediaContent);

//toggle trending Status for Movie or Web Series
route.put("/toggleTrendingStatus", checkAccessWithSecretKey(), MovieSeriesController.toggleTrendingStatus);

//handle banner is auto-animated
route.put("/toggleAutoAnimateBanner", checkAccessWithSecretKey(), MovieSeriesController.toggleAutoAnimateBanner);

//toggle active Status for Movie or Web Serie
route.put("/toggleActiveStatus", checkAccessWithSecretKey(), MovieSeriesController.toggleActiveStatus);

//delete movie or webseries
route.delete("/removeMovieSeries", checkAccessWithSecretKey(), MovieSeriesController.removeMovieSeries);

module.exports = route;
