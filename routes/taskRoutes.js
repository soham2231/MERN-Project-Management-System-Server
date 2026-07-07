const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskControllers");

// Create Task
router.post("/", verifyToken, authorizeRoles("Admin", "HOD"), createTask);

// Get All Tasks
router.get("/", verifyToken, getAllTasks);

// Update Task
router.patch("/:id", verifyToken, authorizeRoles("Admin", "HOD"), updateTask);

// Delete Task
router.delete("/:id", verifyToken, authorizeRoles("Admin", "HOD"), deleteTask);

module.exports = router;
