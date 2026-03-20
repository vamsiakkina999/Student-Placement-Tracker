const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  refreshEligibility,
} = require("../controllers/studentController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

router.get("/me", verifyToken, allowRoles("STUDENT"), getMyProfile);
router.put("/me", verifyToken, allowRoles("STUDENT"), updateMyProfile);
router.post("/refresh-eligibility", verifyToken, allowRoles("STUDENT"), refreshEligibility);

module.exports = router;
