const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
  getProjectByID,
  updateStatus,
  getTotalProjects,
  getCompletedProjects,
  getPendingProjects,
  getInProgressProjects,
  getProjectsByStatus,
  getProjectsBySelectedMonth,
} = require("../controllers/projectControllers");
const authorizeRoles = require("../middleware/role");

router.post(
  "/create",
  verifyToken,
  authorizeRoles("Admin", "HOD"),
  createProject,
);

router.get("/all", verifyToken, authorizeRoles("Admin", "HOD"), getAllProjects);

router.put(
  "/update/:id",
  verifyToken,
  authorizeRoles("Admin", "HOD"),
  updateProject,
);

router.delete(
  "/delete/:id",
  verifyToken,
  authorizeRoles("Admin"),
  deleteProject,
);

router.get("/getProject/:id", verifyToken, getProjectByID);

router.patch(
  "/updateStatus/:id",
  verifyToken,
  authorizeRoles("Admin", "HOD"),
  updateStatus,
);

router.get("/getTotalProjects", verifyToken, getTotalProjects);

router.get("/getCompletedProjects", verifyToken, getCompletedProjects);

router.get("/getPendingProjects", verifyToken, getPendingProjects);

router.get("/getInProgressProjects", verifyToken, getInProgressProjects);

router.get("/getProjectsByStatus", verifyToken, getProjectsByStatus);

router.get(
  "/getProjectsBySelectedMonth",
  verifyToken,
  getProjectsBySelectedMonth,
);

module.exports = router;
