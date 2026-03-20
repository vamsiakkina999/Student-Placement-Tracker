const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { isEligible } = require("./jobController");

exports.applyToJob = async (req, res, next) => {
  try {
    const studentStatus = req.user.status || req.user.placementStatus;
    if (studentStatus !== "NOT_PLACED") {
      return res.status(403).json({ message: "You are already placed" });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.lastDateToApply && new Date(job.lastDateToApply) < new Date()) {
      return res.status(400).json({ message: "Application deadline has passed" });
    }

    if (!isEligible(req.user, job)) {
      return res.status(403).json({ message: "Not eligible for this job" });
    }

    const existing = await Application.findOne({
      student: req.user._id,
      job: job._id,
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
      student: req.user._id,
      job: job._id,
      status: "APPLIED",
    });

    res.status(201).json(application);
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

exports.getApplicationsForJob = async (req, res, next) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate(
        "student",
        "name email rollNumber branch batch year cgpa backlogs status placementStatus skills phone resumeUrl"
      )
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

exports.getAllApplications = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate(
        "student",
        "name email rollNumber branch batch year cgpa backlogs status placementStatus skills phone resumeUrl"
      )
      .populate({ path: "job", populate: { path: "company" } })
      .sort({ createdAt: -1 });

    const validApplications = applications.filter((app) => app.student && app.job);
    const orphaned = applications.filter((app) => !app.student || !app.job);
    if (orphaned.length > 0) {
      await Application.deleteMany({ _id: { $in: orphaned.map((a) => a._id) } });
    }

    res.json(validApplications);
  } catch (error) {
    next(error);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, offerLetterUrl, joiningDate, packageOffered } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    if (offerLetterUrl !== undefined) application.offerLetterUrl = offerLetterUrl;
    if (joiningDate !== undefined) application.joiningDate = joiningDate;
    if (packageOffered !== undefined) application.packageOffered = packageOffered;
    await application.save();

    if (status === "SELECTED") {
      await User.findByIdAndUpdate(application.student, {
        placementStatus: "PLACED",
        status: "PLACED",
      });
    }

    await Notification.create({
      studentId: application.student,
      title: "Application Status Update",
      message: `Your application status changed to ${status}.`,
    });

    res.json(application);
  } catch (error) {
    next(error);
  }
};
