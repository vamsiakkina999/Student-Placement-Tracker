const express = require("express");
const router = express.Router();
const {
  createJob,
  getJobs,
  getEligibleJobs,
  getEligibleStudents,
  getPublicJobs,
  getAllJobsForStudent,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const { applyToJob } = require("../controllers/applicationController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

router.get("/public", getPublicJobs);
router.get("/all", verifyToken, allowRoles("STUDENT"), getAllJobsForStudent);
router.get("/", verifyToken, allowRoles("ADMIN", "STUDENT"), getJobs);
router.get("/eligible", verifyToken, allowRoles("STUDENT"), getEligibleJobs);
router.post("/", verifyToken, allowRoles("ADMIN"), createJob);
router.get("/:jobId/eligible", verifyToken, allowRoles("ADMIN"), getEligibleStudents);
router.post("/:jobId/apply", verifyToken, allowRoles("STUDENT"), applyToJob);
router.put("/:id", verifyToken, allowRoles("ADMIN"), updateJob);
router.delete("/:id", verifyToken, allowRoles("ADMIN"), deleteJob);

module.exports = router;
