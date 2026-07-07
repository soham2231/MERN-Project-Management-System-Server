const Project = require("../models/projectModel");

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

    const project = await Project.create({
      projectName,

      description,

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
    const projects = await Project.find({
      createdBy: req.user.id,
    })
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

    const {
      projectName,

      description,

      status,

      startDate,

      endDate,
    } = req.body;

    project.projectName = projectName || project.projectName;

    project.description = description || project.description;

    project.status = status || project.status;

    project.startDate = startDate || project.startDate;

    project.endDate = endDate || project.endDate;

    if (new Date(updatedEndDate) < new Date(updatedStartDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after Start date.",
      });
    }

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

module.exports = {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
};
