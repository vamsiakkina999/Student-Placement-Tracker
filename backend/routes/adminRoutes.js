const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  getStudentProfile,
  getAdminStats,
  createAdmin,
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
} = require("../controllers/adminController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

router.get("/students", verifyToken, allowRoles("ADMIN"), getAllStudents);
router.get("/students/:id", verifyToken, allowRoles("ADMIN"), getStudentProfile);
router.get("/stats", verifyToken, allowRoles("ADMIN"), getAdminStats);
router.post("/create-admin", verifyToken, allowRoles("ADMIN"), createAdmin);
router.post("/companies", verifyToken, allowRoles("ADMIN"), createCompany);
router.get("/companies", verifyToken, allowRoles("ADMIN"), getCompanies);
router.put("/companies/:id", verifyToken, allowRoles("ADMIN"), updateCompany);
router.delete("/companies/:id", verifyToken, allowRoles("ADMIN"), deleteCompany);

module.exports = router;
