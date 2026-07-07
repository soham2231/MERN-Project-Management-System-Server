const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");
const {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
} = require("../controllers/projectControllers");

router.post("/create", verifyToken, createProject);
router.get("/all", verifyToken, getAllProjects);
router.put("/update", verifyToken, updateProject);
router.delete("/delete", verifyToken, deleteProject);

module.exports = router;
