const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  markRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/my", protect, getMyNotifications);
router.put("/:id/read", protect, markRead);

module.exports = router;
