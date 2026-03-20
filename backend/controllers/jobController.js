const Job = require("../models/Job");
const User = require("../models/User");
const JobEligibility = require("../models/JobEligibility");
const Notification = require("../models/Notification");
const Application = require("../models/Application");

const isEligible = (user, job) => {
  const { eligibility } = job;
  if (!eligibility) return true;

  if (eligibility.minCGPA && (user.cgpa || 0) < eligibility.minCGPA) return false;
  if (Array.isArray(eligibility.allowedBranches) && eligibility.allowedBranches.length > 0) {
    const allowed = eligibility.allowedBranches.map((b) =>
      String(b).toLowerCase().trim()
    );
    const userBranch = String(user.branch || "").toLowerCase().trim();
    if (!userBranch || !allowed.includes(userBranch)) return false;
  }
  if (
    Array.isArray(eligibility.requiredSkills) &&
    eligibility.requiredSkills.length > 0
  ) {
    const userSkills = Array.isArray(user.skills) ? user.skills : [];
    const userSkillSet = new Set(
      userSkills.map((s) => String(s).toLowerCase().trim()).filter(Boolean)
    );
    const hasAll = eligibility.requiredSkills.every((skill) =>
      userSkillSet.has(String(skill).toLowerCase().trim())
    );
    if (!hasAll) return false;
  }
  const userStatus = user.status || user.placementStatus || "NOT_PLACED";
  if (eligibility.requiredStatus && userStatus !== eligibility.requiredStatus) {
    return false;
  }
  if (eligibility.maxBacklogs != null && (user.backlogs || 0) > eligibility.maxBacklogs)
    return false;
  return true;
};

exports.createJob = async (req, res, next) => {
  try {
    const {
      company,
      jobRole,
      title,
      description,
      location,
      package: pkg,
      eligibility,
      lastDateToApply,
    } = req.body;

    const normalizedEligibility = eligibility || {};
    const requiredSkills = Array.isArray(normalizedEligibility.requiredSkills)
      ? normalizedEligibility.requiredSkills
          .map((skill) => String(skill).trim())
          .filter(Boolean)
      : [];

    if (requiredSkills.length === 0) {
      return res.status(400).json({ message: "Required skills are mandatory." });
    }

    const job = await Job.create({
      company,
      jobRole,
      title: title || jobRole,
      description,
      location,
      package: pkg,
      eligibility: {
        ...normalizedEligibility,
        requiredSkills,
      },
      lastDateToApply,
      createdBy: req.user._id,
    });

    const students = await User.find({
      role: "STUDENT",
    });

    const eligibleStudents = students.filter((student) => isEligible(student, job));

    if (eligibleStudents.length > 0) {
      await JobEligibility.insertMany(
        eligibleStudents.map((student) => ({
          job: job._id,
          student: student._id,
        })),
        { ordered: false }
      ).catch(() => {});

      await Notification.insertMany(
        eligibleStudents.map((student) => ({
          studentId: student._id,
          title: "New Eligible Drive",
          message: `You are eligible for ${job.jobRole}. Check and apply soon.`,
        })),
        { ordered: false }
      ).catch(() => {});
    }

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    if (req.user.role === "STUDENT") {
      const studentStatus = req.user.status || req.user.placementStatus;
      if (studentStatus !== "NOT_PLACED") {
        return res.json([]);
      }
      const eligible = await JobEligibility.find({ student: req.user._id })
        .populate({ path: "job", populate: { path: "company" } })
        .sort({ createdAt: -1 });
      const jobs = eligible
        .map((entry) => entry.job)
        .filter(Boolean)
        .filter((job) => {
          if (job.lastDateToApply && job.lastDateToApply < new Date()) return false;
          return true;
        });
      return res.json(jobs);
    }

    const jobs = await Job.find().populate("company").sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

exports.getAllJobsForStudent = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate("company").sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

exports.getPublicJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate("company")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

exports.getEligibleJobs = async (req, res, next) => {
  try {
    const studentStatus = req.user.status || req.user.placementStatus;
    if (studentStatus !== "NOT_PLACED") {
      return res.json([]);
    }
    const entries = await JobEligibility.find({ student: req.user._id })
      .populate({ path: "job", populate: { path: "company" } })
      .sort({ createdAt: -1 });
    const now = new Date();
    const eligible = entries
      .map((entry) => entry.job)
      .filter(Boolean)
      .filter((job) => !job.lastDateToApply || job.lastDateToApply >= now);
    res.json(eligible);
  } catch (error) {
    next(error);
  }
};

exports.getEligibleStudents = async (req, res, next) => {
  try {
    const selectedApps = await Application.find({
      job: req.params.jobId,
      status: "SELECTED",
    }).select("student");
    const selectedIds = selectedApps.map((a) => String(a.student));

    const entries = await JobEligibility.find({ job: req.params.jobId }).populate(
      "student",
      "name email rollNumber branch batch year cgpa skills status placementStatus"
    );
    const students = entries
      .map((entry) => entry.student)
      .filter(Boolean)
      .filter((student) => !selectedIds.includes(String(student._id)));
    res.json(students);
  } catch (error) {
    next(error);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job deleted" });
  } catch (error) {
    next(error);
  }
};

exports.isEligible = isEligible;
