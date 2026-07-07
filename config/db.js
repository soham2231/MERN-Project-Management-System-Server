const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    console.log(
      process.env.MONGO_URL_ATLAS,
      "=============================+++++++++++++++++++++++================================================  ",
    );
    await mongoose.connect(process.env.MONGO_URL_ATLAS);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.log("❌ MongoDB Connection Failed");
    console.log(
      error.message,
      "err msg===========================================",
    );
    console.log(error, "err ===========================================");

    process.exit(1);
  }
};
// connectDB();
module.exports = connectDB;
