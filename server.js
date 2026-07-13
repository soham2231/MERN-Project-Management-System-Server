const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const taskAssignmentRoutes = require("./routes/taskAssignRoutes");

// Load environment variables
dotenv.config();
connectDB();

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//=========for tasks
app.use("/tasks", taskRoutes);

//==========for user
app.use("/users", userRoutes);

//=========for projects
app.use("/projects", projectRoutes);

//==========for dashboard
app.use("/dashboard", dashboardRoutes);

//===========for assign tasks or assigned tasks

app.use("/taskAssignments", taskAssignmentRoutes);

//multer for mg up dwnld-
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test Route
app.get("/", (req, res) => {
  res.send("Project Management System API is Running...");
});

// Port
const PORT = process.env.PORT || 7000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("http://localhost:7000/");
});

// # atlas usrname and password
// # sohamcs2003_db_user
// # UJZDRm75Bw02eWdn
