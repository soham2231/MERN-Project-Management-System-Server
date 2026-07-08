const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");

const { getDashboard } = require("../controllers/dashboardControllers");

router.get("/", verifyToken, getDashboard);

module.exports = router;
