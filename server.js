const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Project Management API Running...");
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});