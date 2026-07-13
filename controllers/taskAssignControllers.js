const TaskAssignment = require("../models/assignTaskUser");
const Task = require("../models/taskModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

const assignTask = async (req, res) => {
  try {
    const { task, assignedTo } = req.body;

    if (!task || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Task ID and User ID are required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(task) ||
      !mongoose.Types.ObjectId.isValid(assignedTo)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID or User ID.",
      });
    }

    const existingTask = await Task.findById(task);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const user = await User.findById(assignedTo);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role !== "Member") {
      return res.status(400).json({
        success: false,
        message: "Task can only be assigned to Members.",
      });
    }

    const alreadyAssigned = await TaskAssignment.findOne({
      task,
      assignedTo,
    });

    if (alreadyAssigned) {
      return res.status(409).json({
        success: false,
        message: "Task is already assigned to this user.",
      });
    }

    const assignment = await TaskAssignment.create({
      task,
      assignedTo,
      assignedBy: req.user.id,
    });

    await assignment.populate([
      {
        path: "task",
        select: "title status priority",
      },
      {
        path: "assignedTo",
        select: "fullName email",
      },
      {
        path: "assignedBy",
        select: "fullName email",
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Task assigned successfully.",
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllAssignments = async (req, res) => {
  try {
    const assignments = await TaskAssignment.find()
      .populate("task", "title status priority")
      .populate("assignedTo", "fullName email")
      .populate("assignedBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Assignment ID.",
      });
    }

    const validStatus = ["Assigned", "Accepted", "Completed"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Assignment Status.",
      });
    }

    const assignment = await TaskAssignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    assignment.status = status;

    await assignment.save();

    res.status(200).json({
      success: true,
      message: "Assignment status updated successfully.",
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  assignTask,
  getAllAssignments,
  updateAssignmentStatus,
};
