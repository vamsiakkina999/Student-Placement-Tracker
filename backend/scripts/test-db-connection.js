const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected (one-off test)");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("MongoDB Connection Failed (one-off test)");
    console.error(error?.message || error);
    process.exit(1);
  }
};

run();
