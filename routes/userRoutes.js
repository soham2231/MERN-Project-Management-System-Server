const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  getMembers,
  updateProfile,
  changePassword,
  updateUserRole,
  deleteUser,
  updateUser,
  getUserById,
  getAllUsers,
} = require("../controllers/userControllers");
const verifyToken = require("../middleware/auth");
const upload = require("../middleware/uploads");
const authorizeRoles = require("../middleware/role");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", verifyToken, getUserProfile);

router.get("/members", verifyToken, getMembers);

router.patch(
  "/update-profile",
  verifyToken,
  upload.single("profileImage"),
  updateProfile,
);

router.patch("/change-password", verifyToken, changePassword);

router.get(
  "/getAllUsers",
  verifyToken,
  authorizeRoles("Admin", "HOD"),
  getAllUsers,
);

router.get(
  "/getUser/:id",
  verifyToken,
  authorizeRoles("Admin", "HOD"),
  getUserById,
);

router.put(
  "/updateUser/:id",
  verifyToken,
  authorizeRoles("Admin", "HOD"),
  updateUser,
);

router.delete(
  "/deleteUser/:id",
  verifyToken,
  authorizeRoles("Admin"),
  deleteUser,
);

router.patch(
  "/updateRole/:id",
  verifyToken,
  authorizeRoles("Admin"),
  updateUserRole,
);
module.exports = router;
