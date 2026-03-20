const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

router.post("/test", async (req, res, next) => {
  try {
    const to = req.body.to;
    if (!to) {
      return res.status(400).json({ message: "Recipient email is required" });
    }

    const subject = "Placement Tracker Email Test";
    const text = "This is a test email from Student Placement Tracker.";
    const html = `
      <div style="font-family: Arial, sans-serif; color: #1c1b1a;">
        <h2>Placement Tracker Email Test</h2>
        <p>This is a test email from Student Placement Tracker.</p>
      </div>
    `;

    await sendEmail(to, subject, text, html);
    res.json({ message: "Test email sent" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
