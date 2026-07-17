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
    const { id, role } = req.user;

    let filter = {};

    if (role === "Member") {
      filter.assignedTo = id;
    }

    let assignments = await TaskAssignment.find(filter)
      .populate({
        path: "task",
        select: "title description status priority project createdBy",
        populate: {
          path: "project",
          select: "projectName",
        },
      })
      .populate("assignedTo", "fullName email")
      .populate("assignedBy", "fullName email")
      .sort({ createdAt: -1 });

    if (role === "HOD") {
      assignments = assignments.filter(
        (assignment) =>
          assignment.task &&
          assignment.task.createdBy?.toString() === id.toString(),
      );
    }

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

    const { role } = req.user;

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

    const assignment = await TaskAssignment.findById(id).populate("task");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    // Member can update only their own assignment

    if (role === "Member" && assignment.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    assignment.status = status;

    await assignment.save();

    // Sync Task Status

    if (status === "Assigned") {
      assignment.task.status = "Pending";
    }

    if (status === "Accepted") {
      assignment.task.status = "In Progress";
    }

    if (status === "Completed") {
      assignment.task.status = "Completed";
    }

    await assignment.task.save();

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully.",
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
