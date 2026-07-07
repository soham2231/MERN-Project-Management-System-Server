const express = require("express");
const router = express.Router();

const { registerUser,loginUser, getUserProfile } = require("../controllers/userControllers");
const verifyToken = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", verifyToken, getUserProfile);


module.exports = router;