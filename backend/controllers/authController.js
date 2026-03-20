const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const COLLEGE_DOMAIN = "adityauniversity.in";
const ADMIN_LOCAL_REGEX = /^[A-Za-z][A-Za-z0-9._%+-]*$/;
const ROLL_REGEX = /^[0-9]{2}[A-Z][0-9]{2}[A-Z]{2}[0-9]{3}$/;

const JWT_SECRET = process.env.JWT_SECRET || "placement-tracker-secret";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

const normalizeSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.filter(Boolean);
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const validateAdminEmail = (rawEmail) => {
  const [local, domain] = (rawEmail || "").split("@");
  const adminLocal = (local || "").trim();
  const domainLower = (domain || "").toLowerCase();
  if (!domain || (domainLower !== COLLEGE_DOMAIN && domainLower !== "gmail.com")) {
    return `Admin email must use @${COLLEGE_DOMAIN} or @gmail.com`;
  }
  if (!ADMIN_LOCAL_REGEX.test(adminLocal)) {
    return "Admin email must start with a letter and use only letters, numbers, or ._%+-";
  }
  return null;
};

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*\d)[a-z\d]{6,10}$/;

// ================= REGISTER =================
exports.registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      branch,
      batch,
      cgpa,
      backlogs,
      phone,
      skills,
      resumeUrl,
      role,
    } = req.body;
    const rawEmail = (email || "").trim();
    const normalizedEmail = rawEmail.toLowerCase();
    const roleNormalized = (role || "STUDENT").toUpperCase();

    if (!PASSWORD_REGEX.test(password || "")) {
      return res.status(400).json({
        message:
          "Password must be 6-10 characters, lowercase only, and include letters and numbers.",
      });
    }

    if (roleNormalized === "ADMIN") {
      const adminError = validateAdminEmail(rawEmail);
      if (adminError) {
        return res.status(400).json({ message: adminError });
      }
      const existingAdmin = await User.findOne({ role: "ADMIN" });
      if (existingAdmin) {
        return res.status(400).json({ message: "Only one admin allowed" });
      }
    }

    // Validate email format for students: 24B11CS007@adityauniversity.in
    let rollNumber = "ADMIN";
    if (roleNormalized === "STUDENT") {
      const domainRegex = new RegExp(`@${COLLEGE_DOMAIN.replace(/\./g, "\\.")}$`, "i");
      const [rollNumberRaw, domain] = rawEmail.split("@");
      rollNumber = (rollNumberRaw || "").toUpperCase();

      if (!domain || !domainRegex.test(`@${domain}`) || !ROLL_REGEX.test(rollNumber)) {
        return res.status(400).json({
          message: `Email must be in format 24B11CS007@${COLLEGE_DOMAIN}`,
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const numericCgpa = cgpa !== undefined ? Number(cgpa) : undefined;
    const numericBacklogs = backlogs !== undefined ? Number(backlogs) : undefined;
    const normalizedPhone = phone ? String(phone).trim() : "";
    if (normalizedPhone && !/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({ message: "Phone number must be 10 digits." });
    }

    // Create user
    const isStudent = roleNormalized === "STUDENT";

    await User.create({
      name,
      email: normalizedEmail,
      rollNumber,
      password: hashedPassword,
      branch: isStudent ? branch : undefined,
      batch: isStudent ? batch : undefined,
      year: isStudent ? req.body.year : undefined,
      cgpa: isStudent ? numericCgpa : undefined,
      status: isStudent ? (req.body.status || "NOT_PLACED") : "NOT_PLACED",
      backlogs: isStudent ? numericBacklogs : undefined,
      phone: normalizedPhone || undefined,
      skills: isStudent ? normalizeSkills(skills) : [],
      resumeUrl: isStudent ? resumeUrl : undefined,
      role: roleNormalized,
      placementStatus: "NOT_PLACED",
    });

    // Send welcome email
    const isStudentEmail = roleNormalized === "STUDENT";
    const subject = isStudentEmail
      ? "Student Placement Tracker - Successfully Registered"
      : "Student Placement Tracker - Admin Account Ready";
    const text = isStudentEmail
      ? `Hello ${name}, your registration was successful. You can now log in.`
      : `Hello ${name}, your admin account is ready. You can now log in.`;
    const html = isStudentEmail
      ? `
        <div style="font-family: Arial, sans-serif; color: #1c1b1a; line-height: 1.6;">
          <h2 style="margin: 0 0 8px;">Welcome to Student Placement Tracker</h2>
          <p style="margin: 0 0 12px;">Hi ${name},</p>
          <p style="margin: 0 0 12px;">
            <span style="color: #2a7f62; font-weight: 700; font-size: 18px;">
              Successfully Registered
            </span>
          </p>
          <p style="margin: 0 0 12px;">
            Your account is ready. You can now log in and complete your profile to
            start exploring eligible drives.
          </p>
          <p style="margin: 0 0 12px;">
            Stay prepared, keep your profile updated, and track your application
            status right from your dashboard.
          </p>
          <p style="margin: 18px 0 0;">Thanks,<br/>Placement Tracker Team</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; color: #1c1b1a; line-height: 1.6;">
          <h2 style="margin: 0 0 8px;">Welcome Admin</h2>
          <p style="margin: 0 0 12px;">Hi ${name},</p>
          <p style="margin: 0 0 12px;">
            <span style="color: #2a7f62; font-weight: 700; font-size: 18px;">
              Admin Account Successfully Registered
            </span>
          </p>
          <p style="margin: 0 0 12px;">
            Your admin access is now active. You can log in to create drives,
            review applications, and manage students.
          </p>
          <p style="margin: 0 0 12px;">
            Keep postings accurate and timely so students can apply confidently.
          </p>
          <p style="margin: 18px 0 0;">Thanks,<br/>Placement Tracker Team</p>
        </div>
      `;
    await sendEmail(normalizedEmail, subject, text, html);

    res.status(201).json({
      message: "Registration successful. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

// ================= LOGIN =================
const buildLoginResponse = (user) => ({
  token: generateToken(user._id),
  role: (user.role || "").toUpperCase(),
  name: user.name,
});

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || "").toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        message: "No account found. Please register first.",
      });
    }

    if (user.role === "ADMIN") {
      const adminError = validateAdminEmail(email);
      if (adminError) {
        return res.status(400).json({ message: adminError });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.json(buildLoginResponse(user));
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN BOOTSTRAP =================
exports.bootstrapAdmin = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!process.env.ADMIN_SECRET) {
      return res.status(500).json({ message: "ADMIN_SECRET not set" });
    }

    if (req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const adminError = validateAdminEmail(email);
    if (adminError) {
      return res.status(400).json({ message: adminError });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingAdmin = await User.findOne({ role: "ADMIN" });
    if (existingAdmin) {
      return res.status(400).json({ message: "Only one admin allowed" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email,
      rollNumber: "ADMIN",
      password: hashedPassword,
      role: "ADMIN",
    });

    res.status(201).json({ message: "Admin created" });
  } catch (error) {
    next(error);
  }
};
