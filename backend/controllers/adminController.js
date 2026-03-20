const User = require("../models/User");
const Job = require("../models/Job");
const Company = require("../models/Company");
const Application = require("../models/Application");
const bcrypt = require("bcryptjs");
const COLLEGE_DOMAIN = "adityauniversity.in";
const ADMIN_LOCAL_REGEX = /^[A-Za-z][A-Za-z0-9._%+-]*$/;

exports.getAllStudents = async (req, res, next) => {
  try {
    const { branch, minCgpa, placementStatus, skills, status, year } = req.query;
    const filter = { role: "STUDENT" };

    if (branch) filter.branch = branch;
    if (placementStatus) filter.placementStatus = placementStatus;
    if (status) filter.status = status;
    if (year) filter.year = year;
    if (minCgpa) filter.cgpa = { $gte: Number(minCgpa) };
    if (skills) {
      const skillList = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (skillList.length > 0) filter.skills = { $all: skillList };
    }

    const students = await User.find(filter).select("-password");
    res.json(students);
  } catch (error) {
    next(error);
  }
};

exports.getStudentProfile = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id).select("-password");
    if (!student || student.role !== "STUDENT") {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    next(error);
  }
};

exports.getAdminStats = async (req, res, next) => {
  try {
    const [students, drives, applicationsList] = await Promise.all([
      User.countDocuments({ role: "STUDENT" }),
      Job.countDocuments(),
      Application.find()
        .populate("student", "_id")
        .populate("job", "_id")
        .select("_id status"),
    ]);
    const validApplications = applicationsList.filter((app) => app.student && app.job);
    const applications = validApplications.filter((app) => app.status === "APPLIED")
      .length;
    const placed = validApplications.filter((app) => app.status === "SELECTED").length;

    res.json({
      students,
      drives,
      applications,
      placed,
    });
  } catch (error) {
    next(error);
  }
};

exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, and password are required" });
    }

    const [local, domain] = (email || "").split("@");
    const adminLocal = (local || "").trim();
    const domainLower = (domain || "").toLowerCase();
    if (!domain || (domainLower !== COLLEGE_DOMAIN && domainLower !== "gmail.com")) {
      return res
        .status(400)
        .json({ message: `Admin email must use @${COLLEGE_DOMAIN} or @gmail.com` });
    }
    if (!ADMIN_LOCAL_REGEX.test(adminLocal)) {
      return res.status(400).json({
        message:
          "Admin email must start with a letter and use only letters, numbers, or ._%+-",
      });
    }

    const existingAdmin = await User.findOne({ role: "ADMIN" });
    if (existingAdmin) {
      return res.status(400).json({ message: "Only one admin allowed" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email: email.toLowerCase(),
      rollNumber: "ADMIN",
      password: hashedPassword,
      role: "ADMIN",
    });

    res.status(201).json({ message: "Admin created" });
  } catch (error) {
    next(error);
  }
};

exports.createCompany = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.contactNumber !== undefined) {
      const rawPhone = String(payload.contactNumber || "").trim();
      if (rawPhone && !/^\d{10}$/.test(rawPhone)) {
        return res.status(400).json({ message: "Contact number must be 10 digits." });
      }
      payload.contactNumber = rawPhone || undefined;
    }
    const company = await Company.create(payload);
    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.contactNumber !== undefined) {
      const rawPhone = String(payload.contactNumber || "").trim();
      if (rawPhone && !/^\d{10}$/.test(rawPhone)) {
        return res.status(400).json({ message: "Contact number must be 10 digits." });
      }
      payload.contactNumber = rawPhone || undefined;
    }
    const company = await Company.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(company);
  } catch (error) {
    next(error);
  }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json({ message: "Company deleted" });
  } catch (error) {
    next(error);
  }
};
