const Project = require("../models/projectModel");
const Task = require("../models/taskModel");
const TaskAssignment = require("../models/assignTaskUser");

const getDashboard = async (req, res) => {
  try {
    const { id, role } = req.user;

    let projectFilter = {};
    let taskFilter = {};

    // ================= ROLE BASED FILTER =================

    if (role === "HOD") {
      projectFilter = { createdBy: id };
      taskFilter = { createdBy: id };
    }

    let assignmentFilter = {};

    if (role === "Member") {
      assignmentFilter = { assignedTo: id };
    }

    // ================= COUNTS =================

    const [
      totalProjects,
      completedProjects,
      pendingProjects,
      inProgressProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
    ] = await Promise.all([
      Project.countDocuments(projectFilter),

      Project.countDocuments({
        ...projectFilter,
        status: "Completed",
      }),

      Project.countDocuments({
        ...projectFilter,
        status: "Pending",
      }),

      Project.countDocuments({
        ...projectFilter,
        status: "In Progress",
      }),

      Task.countDocuments(taskFilter),

      Task.countDocuments({
        ...taskFilter,
        status: "Completed",
      }),

      Task.countDocuments({
        ...taskFilter,
        status: "Pending",
      }),

      Task.countDocuments({
        ...taskFilter,
        status: "In Progress",
      }),
    ]);

    // ================= RECENT PROJECTS =================

    const recentProjects = await Project.find(projectFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "fullName email role");

    // ================= RECENT TASKS =================

    const recentTasks = await Task.find(taskFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("project", "projectName")
      .populate("createdBy", "fullName email");

    const recentAssignments = await TaskAssignment.find(assignmentFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("task", "title priority status")
      .populate("assignedBy", "fullName email");
    // ================= RESPONSE =================

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully.",

      data: {
        userRole: role,

        projects: {
          totalProjects,
          completedProjects,
          pendingProjects,
          inProgressProjects,
        },

        tasks: {
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
        },

        recentProjects,
        recentTasks,
        recentAssignments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};
