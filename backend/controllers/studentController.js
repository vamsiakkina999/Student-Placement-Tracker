const Job = require("../models/Job");
const Application = require("../models/Application");
const JobEligibility = require("../models/JobEligibility");
const { isEligible } = require("./jobController");

exports.getMyProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

exports.updateMyProfile = async (req, res, next) => {
  try {
    const allowed = [
      "name",
      "cgpa",
      "branch",
      "batch",
      "year",
      "status",
      "backlogs",
      "phone",
      "skills",
      "resumeUrl",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (typeof updates.skills === "string") {
      updates.skills = updates.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (updates.phone !== undefined) {
      const rawPhone = String(updates.phone || "").trim();
      if (rawPhone && !/^\d{10}$/.test(rawPhone)) {
        return res.status(400).json({ message: "Phone number must be 10 digits." });
      }
      updates.phone = rawPhone || undefined;
    }

    Object.assign(req.user, updates);
    if (updates.status) {
      req.user.placementStatus = updates.status;
    }
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

exports.getEligibleJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate("company").sort({ createdAt: -1 });
    const now = new Date();
    const eligible = jobs.filter((job) => {
      const studentStatus = req.user.status || req.user.placementStatus;
      if (studentStatus !== "NOT_PLACED") return false;
      if (job.lastDateToApply && job.lastDateToApply < now) return false;
      return isEligible(req.user, job);
    });
    res.json(eligible);
  } catch (error) {
    next(error);
  }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({ path: "job", populate: { path: "company" } })
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

exports.refreshEligibility = async (req, res, next) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    await JobEligibility.deleteMany({ student: req.user._id });

    const eligibleJobs = jobs.filter((job) => isEligible(req.user, job));
    if (eligibleJobs.length > 0) {
      await JobEligibility.insertMany(
        eligibleJobs.map((job) => ({
          job: job._id,
          student: req.user._id,
        })),
        { ordered: false }
      ).catch(() => {});
    }

    res.json({ message: "Eligibility refreshed", count: eligibleJobs.length });
  } catch (error) {
    next(error);
  }
};
