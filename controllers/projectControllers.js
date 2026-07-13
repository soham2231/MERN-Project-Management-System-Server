const Project = require("../models/projectModel");
const mongoose = require("mongoose");
const Task = require("../models/taskModel");
const TaskAssignment = require("../models/assignTaskUser");

const createProject = async (req, res) => {
  try {
    const { projectName, description, startDate, endDate, status } = req.body;

    if (!projectName || !description || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const validStatus = ["Pending", "In Progress", "Completed"];
    if (status && !validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values are: Pending, In Progress, Completed.",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after Start date.",
      });
    }

    const existingProject = await Project.findOne({
      createdBy: req.user.id,
      projectName: {
        $regex: new RegExp(`^${projectName.trim()}$`, "i"),
      },
    });

    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: "Project with this name already exists.",
      });
    }

    const project = await Project.create({
      projectName: projectName.trim(),
      description: description.trim(),

      startDate,

      endDate,

      status,

      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,

      message: "Project Created Successfully",

      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

const getAllProjects = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "HOD") {
      filter.createdBy = req.user.id;
    }

    const projects = await Project.find(filter)
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,

      count: projects.length,

      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    //getting id form the url
    const { id } = req.params;
    //finsding project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,

        message: "Project not found.",
      });
    }

    //validate only owner can handle respective project
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { projectName, description, status, startDate, endDate } = req.body;

    const updatedStartDate = startDate || project.startDate;
    const updatedEndDate = endDate || project.endDate;

    if (projectName) {
      const existingProject = await Project.findOne({
        createdBy: req.user.id,
        projectName: {
          $regex: new RegExp(`^${projectName.trim()}$`, "i"),
        },
        _id: { $ne: project._id },
      });

      if (existingProject) {
        return res.status(409).json({
          success: false,
          message: "Project with this name already exists.",
        });
      }
    }

    const validStatus = ["Pending", "In Progress", "Completed"];

    if (status && !validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values are: Pending, In Progress, Completed.",
      });
    }

    // Date Validation
    if (new Date(updatedEndDate) < new Date(updatedStartDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after Start date.",
      });
    }

    project.projectName = projectName || project.projectName;
    project.description = description || project.description;
    project.status = status || project.status;
    project.startDate = updatedStartDate;
    project.endDate = updatedEndDate;

    await project.save();
    res.status(200).json({
      success: true,

      message: "Project Updated Successfully",

      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    //getting id form the url
    const { id } = req.params;
    //finsding project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,

        message: "Project not found.",
      });
    }

    //validate only owner can handle respective project
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const tasks = await Task.find({
      project: project._id,
    });

    const taskIds = tasks.map((task) => task._id);

    await TaskAssignment.deleteMany({
      task: {
        $in: taskIds,
      },
    });

    await Task.deleteMany({
      project: project._id,
    });

    await project.deleteOne();
    res.status(200).json({
      success: true,

      message: "Project Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProjectByID = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Project ID.",
      });
    }

    if (
      req.user.role === "HOD" &&
      project.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const project = await Project.findById(id).populate(
      "createdBy",
      "fullName email role",
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Project ID.",
      });
    }

    const validStatus = ["Pending", "In Progress", "Completed"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values are Pending, In Progress and Completed.",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (project.status === status) {
      return res.status(400).json({
        success: false,
        message: `Project is already ${status}.`,
      });
    }

    project.status = status;

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project status updated successfully.",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//=====================================DASHBOARD APIS===================================================

const getTotalProjects = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();

    res.status(200).json({
      success: true,
      totalProjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCompletedProjects = async (req, res) => {
  try {
    const totalCompletedProjects = await Project.countDocuments({
      status: "Completed",
    });

    res.status(200).json({
      success: true,
      totalCompletedProjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPendingProjects = async (req, res) => {
  try {
    const totalPendingProjects = await Project.countDocuments({
      status: "Pending",
    });

    res.status(200).json({
      success: true,
      totalPendingProjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getInProgressProjects = async (req, res) => {
  try {
    const totalInProgressProjects = await Project.countDocuments({
      status: "In Progress",
    });

    res.status(200).json({
      success: true,
      totalInProgressProjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProjectsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const validStatus = ["Pending", "In Progress", "Completed"];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status.",
      });
    }

    const projects = await Project.find({ status }).populate(
      "createdBy",
      "fullName email",
    );

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProjectsBySelectedMonth = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and Year are required.",
      });
    }

    const startDate = new Date(year, month - 1, 1);

    const endDate = new Date(year, month, 1);

    const projects = await Project.find({
      startDate: {
        $gte: startDate,
        $lt: endDate,
      },
    }).populate("createdBy", "fullName email");

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
};
