const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
} = require("../controllers/projectControllers");
const authorizeRoles = require("../middleware/role");

router.post("/create", verifyToken,authorizeRoles("Admin","HOD"), createProject);
router.get("/all", verifyToken,authorizeRoles("Admin","HOD"), getAllProjects);
router.put("/update", verifyToken,authorizeRoles("Admin","HOD"), updateProject);
router.delete("/delete", verifyToken,authorizeRoles("Admin","HOD"), deleteProject);

module.exports = router;
