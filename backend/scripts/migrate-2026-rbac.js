const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Job = require("../models/Job");
const Company = require("../models/Company");
const Application = require("../models/Application");

dotenv.config();

const mapApplicationStatus = (status) => {
  const normalized = (status || "").toString().toLowerCase();
  if (normalized === "applied") return "APPLIED";
  if (normalized === "shortlisted") return "SHORTLISTED";
  if (normalized === "interviewed") return "INTERVIEW";
  if (normalized === "placed") return "SELECTED";
  if (normalized === "rejected") return "REJECTED";
  return "APPLIED";
};

const toUpperRole = (role) => {
  const normalized = (role || "").toString().toLowerCase();
  if (normalized === "admin") return "ADMIN";
  return "STUDENT";
};

const migrate = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not set");
  }

  await mongoose.connect(process.env.MONGO_URI);

  // Users: role -> uppercase, ensure placementStatus exists
  const users = await User.find();
  for (const user of users) {
    user.role = toUpperRole(user.role);
    if (!user.placementStatus) user.placementStatus = "NOT_PLACED";
    await user.save();
  }

  // Jobs: convert companyName -> Company + new schema fields
  const jobs = await Job.find();
  for (const job of jobs) {
    let companyId = job.company;
    if (!companyId && job.companyName) {
      const existing = await Company.findOne({ name: job.companyName.trim() });
      const company = existing
        ? existing
        : await Company.create({ name: job.companyName.trim() });
      companyId = company._id;
    }

    job.company = companyId || job.company;
    job.jobRole = job.jobRole || job.role;
    if (!job.lastDateToApply && job.deadline) {
      job.lastDateToApply = job.deadline;
    }

    if (job.eligibility) {
      const allowedBranches = [];
      if (job.eligibility.branch) {
        allowedBranches.push(job.eligibility.branch);
      }
      job.eligibility = {
        minCGPA: job.eligibility.cgpa || job.eligibility.minCGPA,
        allowedBranches:
          job.eligibility.allowedBranches && job.eligibility.allowedBranches.length > 0
            ? job.eligibility.allowedBranches
            : allowedBranches,
        maxBacklogs: job.eligibility.maxBacklogs || job.eligibility.maxBacklogs,
      };
    }

    await job.save();
  }

  // Applications: studentId/jobId -> student/job, status -> new enum
  const applications = await Application.find();
  for (const app of applications) {
    app.student = app.student || app.studentId;
    app.job = app.job || app.jobId;
    app.status = mapApplicationStatus(app.status);
    await app.save();

    if (app.status === "SELECTED" && app.student) {
      await User.findByIdAndUpdate(app.student, { placementStatus: "PLACED" });
    }
  }

  await mongoose.disconnect();
  console.log("Migration completed.");
};

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
