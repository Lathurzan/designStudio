// src/routes/analyticsRoutes.js
const express = require("express");
const { getOverview } = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware); // every route below requires a logged-in freelancer

router.get("/overview", getOverview);

module.exports = router;
