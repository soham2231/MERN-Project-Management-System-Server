const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const {
  assignTask,
  updateAssignmentStatus,
  getAllAssignments,
} = require("../controllers/taskAssignControllers");

router.post(
  "/assignTask",
  verifyToken,
  authorizeRoles("Admin", "HOD"),
  assignTask,
);

router.get("/getAllAssignments", verifyToken, getAllAssignments);

router.patch(
  "/updateAssignmentStatus/:id",
  verifyToken,
  updateAssignmentStatus,
);


module.exports = router