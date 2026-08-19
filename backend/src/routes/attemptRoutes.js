const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  startAttempt,
  submitAttempt,
  getAttemptResult,
  getMyAttempts,
} = require("../controllers/attemptController");

const router = express.Router();

router.post("/start", requireAuth, startAttempt);
router.post("/:id/submit", requireAuth, submitAttempt);
router.get("/my", requireAuth, getMyAttempts);
router.get("/:id", requireAuth, getAttemptResult);

module.exports = router;
