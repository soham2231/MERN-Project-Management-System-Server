const mongoose = require("mongoose");
const Task = require("../models/taskModel");
const Project = require("../models/projectModel");
const User = require("../models/userModel");

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignedTo,
    } = req.body;

    // Required Fields
    if (!title || !description || !project || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Status Validation
    const validStatus = ["Pending", "In Progress", "Completed"];

    if (status && !validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values are: Pending, In Progress, Completed.",
      });
    }

    // Priority Validation
    const validPriority = ["Low", "Medium", "High"];

    if (priority && !validPriority.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority. Allowed values are: Low, Medium, High.",
      });
    }

    // Due Date Validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);

    if (taskDueDate < today) {
      return res.status(400).json({
        success: false,
        message: "Due date cannot be in the past.",
      });
    }

    // Validate Project ID
    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Project ID.",
      });
    }

    // Check Project Exists
    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Due Date should be within Project Duration
    if (
      new Date(dueDate) < new Date(existingProject.startDate) ||
      new Date(dueDate) > new Date(existingProject.endDate)
    ) {
      return res.status(400).json({
        success: false,
        message: `Task due date must be between ${existingProject.startDate.toISOString().split("T")[0]} and ${existingProject.endDate.toISOString().split("T")[0]}.`,
      });
    }

    // Duplicate Task Validation
    const existingTask = await Task.findOne({
      project,
      title: {
        $regex: new RegExp(`^${title.trim()}$`, "i"),
      },
    });

    if (existingTask) {
      return res.status(409).json({
        success: false,
        message: "Task with this title already exists in this project.",
      });
    }

    // Assigned User Validation
    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "Invalid User ID.",
        });
      }

      const existingUser = await User.findById(assignedTo);

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "Assigned user not found.",
        });
      }

      if (existingUser.role !== "Member") {
        return res.status(400).json({
          success: false,
          message: "Tasks can only be assigned to Members.",
        });
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
      project,
      assignedTo,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Task Created Successfully.",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("project", "projectName")
      .populate("assignedTo", "fullName email")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const { title, description, status, priority, dueDate, assignedTo } =
      req.body;

    if (assignedTo) {
      const user = await User.findById(assignedTo);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Assigned user not found.",
        });
      }
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.assignedTo = assignedTo || task.assignedTo;

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task Updated Successfully.",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task Deleted Successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID.",
      });
    }

    const task = await Task.findById(id)
      .populate("project", "projectName")
      .populate("assignedTo", "fullName email")
      .populate("createdBy", "fullName email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID.",
      });
    }

    const validStatus = ["Pending", "In Progress", "Completed"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task Status.",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    task.status = status;

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task status updated successfully.",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    // Validate Task ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID.",
      });
    }

    // Validate User ID
    if (!assignedTo || !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID.",
      });
    }

    // Check Task Exists
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Check User Exists
    const user = await User.findById(assignedTo);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Only Members can be assigned
    if (user.role !== "Member") {
      return res.status(400).json({
        success: false,
        message: "Task can only be assigned to Members.",
      });
    }

    task.assignedTo = assignedTo;

    await task.save();

    await task.populate("assignedTo", "fullName email role");

    res.status(200).json({
      success: true,
      message: "Task assigned successfully.",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Project ID.",
      });
    }

    const tasks = await Task.find({
      project: projectId,
    })
      .populate("assignedTo", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTotalTasks = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();

    res.status(200).json({
      success: true,
      totalTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCompletedTasks = async (req, res) => {
  try {
    const totalCompletedTasks = await Task.countDocuments({
      status: "Completed",
    });

    res.status(200).json({
      success: true,
      totalCompletedTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPendingTasks = async (req, res) => {
  try {
    const totalPendingTasks = await Task.countDocuments({
      status: "Pending",
    });

    res.status(200).json({
      success: true,
      totalPendingTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getInProgressTasks = async (req, res) => {
  try {
    const totalInProgressTasks = await Task.countDocuments({
      status: "In Progress",
    });

    res.status(200).json({
      success: true,
      totalInProgressTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTasksByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const validStatus = ["Pending", "In Progress", "Completed"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task Status.",
      });
    }

    const tasks = await Task.find({ status });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTasksBySelectedMonth = async (req, res) => {
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

    const tasks = await Task.find({
      dueDate: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getTaskById,
  updateTaskStatus,
  getTasksByProject,
  getTotalTasks,
  getCompletedTasks,
  getPendingTasks,
  getInProgressTasks,
  getTasksByStatus,
  getTasksBySelectedMonth,
};
