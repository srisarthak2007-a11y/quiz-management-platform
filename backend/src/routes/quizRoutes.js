const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/quizController");
const {
  addQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const { getLeaderboard, getQuizAnalytics } = require("../controllers/attemptController");

const router = express.Router();

// Quizzes - all routes need login; write routes need Admin
router.get("/", requireAuth, getQuizzes);
router.get("/:id", requireAuth, getQuizById);
router.post("/", requireAuth, requireAdmin, createQuiz);
router.put("/:id", requireAuth, requireAdmin, updateQuiz);
router.delete("/:id", requireAuth, requireAdmin, deleteQuiz);

// Questions nested under a quiz (Admin only)
router.post("/:quizId/questions", requireAuth, requireAdmin, addQuestion);
router.put("/questions/:id", requireAuth, requireAdmin, updateQuestion);
router.delete("/questions/:id", requireAuth, requireAdmin, deleteQuestion);

// Leaderboard for a specific quiz
router.get("/:quizId/leaderboard", requireAuth, getLeaderboard);
router.get("/:quizId/analytics", requireAuth, requireAdmin, getQuizAnalytics);

module.exports = router;
