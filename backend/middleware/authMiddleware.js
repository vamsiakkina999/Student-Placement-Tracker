const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "placement-tracker-secret";

const verifyToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    const inferredRole = req.user.role || (req.user.rollNumber === "ADMIN" ? "ADMIN" : "STUDENT");
    req.user.role = (inferredRole || "STUDENT").toUpperCase();
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalid" });
  }
};

const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

exports.verifyToken = verifyToken;
exports.allowRoles = allowRoles;
exports.protect = verifyToken;
exports.adminOnly = allowRoles("ADMIN");
