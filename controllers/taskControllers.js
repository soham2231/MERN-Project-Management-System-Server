const Task = require("../models/taskModel");
const Project = require("../models/projectModel");
const User = require("../models/userModel");

// ========================= CREATE TASK =========================

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
    if (new Date(dueDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Due date cannot be in the past.",
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

    // Check Assigned User Exists
    if (assignedTo) {
      const existingUser = await User.findById(assignedTo);

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "Assigned user not found.",
        });
      }

      // Optional Role Check
      if (existingUser.role !== "Member") {
        return res.status(400).json({
          success: false,
          message: "Tasks can only be assigned to Members.",
        });
      }
    }

    const task = await Task.create({
      title,
      description,
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

// ========================= GET ALL TASKS =========================

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

// ========================= UPDATE TASK =========================

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

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
    } = req.body;

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

// ========================= DELETE TASK =========================

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

module.exports = {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
};