const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "STUDENT"],
      default: "STUDENT",
    },
    branch: String,
    batch: String,
    year: String,
    cgpa: Number,
    status: {
      type: String,
      enum: ["NOT_PLACED", "PLACED"],
      default: "NOT_PLACED",
    },
    backlogs: {
      type: Number,
      default: 0,
    },
    phone: String,
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: String,
    placementStatus: {
      type: String,
      enum: ["NOT_PLACED", "PLACED"],
      default: "NOT_PLACED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
