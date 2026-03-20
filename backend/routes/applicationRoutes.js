const express = require("express");
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  getAllApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

router.post("/:jobId/apply", verifyToken, allowRoles("STUDENT"), applyToJob);
router.get("/my", verifyToken, allowRoles("STUDENT"), getMyApplications);
router.get("/job/:jobId", verifyToken, allowRoles("ADMIN"), getApplicationsForJob);
router.get("/", verifyToken, allowRoles("ADMIN"), getAllApplications);
router.put("/:id/status", verifyToken, allowRoles("ADMIN"), updateApplicationStatus);

module.exports = router;
