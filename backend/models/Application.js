const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    status: {
      type: String,
      enum: ["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"],
      default: "APPLIED",
    },
    offerLetterUrl: String,
    joiningDate: Date,
    packageOffered: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
