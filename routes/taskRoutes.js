const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskById,
  getTasksByProject,
  getTotalTasks,
  getCompletedTasks,
  getPendingTasks,
  getInProgressTasks,
  getTasksByStatus,
  getTasksBySelectedMonth,
} = require("../controllers/taskControllers");

// Create Task
router.post("/create", verifyToken, authorizeRoles("Admin", "HOD"), createTask);

// Get All Tasks
router.get("/all", verifyToken, getAllTasks);

// Update Task
router.patch(
  "/update/:id",
  verifyToken,
  authorizeRoles("Admin", "HOD"),
  updateTask,
);

// Delete Task
router.delete(
  "/delete/:id",
  verifyToken,
  authorizeRoles("Admin", "HOD"),
  deleteTask,
);

//dashboard tasks

router.get("/getTaskById/:id", verifyToken, getTaskById);

router.patch(
  "/updateTaskStatus/:id",
  verifyToken,
  authorizeRoles("Admin", "HOD"),
  updateTaskStatus,
);

router.get("/getTasksByProject/:projectId", verifyToken, getTasksByProject);

router.get("/getTotalTasks", verifyToken, getTotalTasks);

router.get("/getCompletedTasks", verifyToken, getCompletedTasks);

router.get("/getPendingTasks", verifyToken, getPendingTasks);

router.get("/getInProgressTasks", verifyToken, getInProgressTasks);

router.get("/getTasksByStatus", verifyToken, getTasksByStatus);

router.get("/getTasksBySelectedMonth", verifyToken, getTasksBySelectedMonth);

module.exports = router;
