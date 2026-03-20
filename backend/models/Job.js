const mongoose = require("mongoose");

const eligibilitySchema = new mongoose.Schema(
  {
    minCGPA: Number,
    allowedBranches: {
      type: [String],
      default: [],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    requiredStatus: {
      type: String,
      enum: ["NOT_PLACED", "PLACED"],
      default: "NOT_PLACED",
    },
    maxBacklogs: Number,
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    package: {
      type: Number,
    },
    eligibility: eligibilitySchema,
    lastDateToApply: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
