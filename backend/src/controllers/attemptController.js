const prisma = require("../utils/prismaClient");

// POST /api/attempts/start  { quizId }
async function startAttempt(req, res) {
  try {
    const { quizId } = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(quizId) },
      include: { questions: true },
    });

    if (!quiz || !quiz.isPublished) {
      return res.status(404).json({ message: "Quiz not available" });
    }

    const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0);

    const attempt = await prisma.attempt.create({
      data: {
        quizId: quiz.id,
        userId: req.user.id,
        totalMarks,
      },
    });

    return res.status(201).json({
      attemptId: attempt.id,
      quizTitle: quiz.title,
      durationMinutes: quiz.durationMinutes,
      startedAt: attempt.startedAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// POST /api/attempts/:id/submit  { answers: [{ questionId, selectedOption }] }
async function submitAttempt(req, res) {
  try {
    const attemptId = Number(req.params.id);
    const { answers } = req.body; // [{ questionId, selectedOption }]

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { quiz: { include: { questions: true } } },
    });

    if (!attempt || attempt.userId !== req.user.id) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    if (attempt.status === "SUBMITTED") {
      return res.status(400).json({ message: "Attempt already submitted" });
    }

    const questionMap = new Map(attempt.quiz.questions.map((q) => [q.id, q]));
    let score = 0;

    const answerRows = (answers || []).map((a) => {
      const question = questionMap.get(a.questionId);
      const isCorrect = !!question && question.correctOption === a.selectedOption;
      if (isCorrect) score += question.marks;

      return {
        attemptId,
        questionId: a.questionId,
        selectedOption: a.selectedOption || null,
        isCorrect,
      };
    });

    await prisma.$transaction([
      prisma.answer.createMany({ data: answerRows }),
      prisma.attempt.update({
        where: { id: attemptId },
        data: { score, status: "SUBMITTED", submittedAt: new Date() },
      }),
    ]);

    return res.json({
      message: "Quiz submitted",
      score,
      totalMarks: attempt.totalMarks,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// GET /api/attempts/:id  (result + answer review)
async function getAttemptResult(req, res) {
  try {
    const attemptId = Number(req.params.id);

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: true,
        answers: { include: { question: true } },
      },
    });

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    // Students can only view their own attempts; Admin can view any
    if (req.user.role !== "ADMIN" && attempt.userId !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    return res.json(attempt);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// GET /api/attempts/my  (logged-in student's own attempt history)
async function getMyAttempts(req, res) {
  try {
    const attempts = await prisma.attempt.findMany({
      where: { userId: req.user.id, status: "SUBMITTED" },
      include: { quiz: { select: { title: true } } },
      orderBy: { submittedAt: "desc" },
    });
    return res.json(attempts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// GET /api/quizzes/:quizId/leaderboard  (top scorers for a quiz)
async function getLeaderboard(req, res) {
  try {
    const quizId = Number(req.params.quizId);

    const leaderboard = await prisma.attempt.findMany({
      where: { quizId, status: "SUBMITTED" },
      include: { user: { select: { name: true } } },
      orderBy: [{ score: "desc" }, { submittedAt: "asc" }],
      take: 10,
    });

    return res.json(
      leaderboard.map((a, index) => ({
        rank: index + 1,
        name: a.user.name,
        score: a.score,
        totalMarks: a.totalMarks,
      }))
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function getQuizAnalytics(req, res) {
  try {
    const quizId = Number(req.params.quizId);

    const attempts = await prisma.attempt.findMany({
      where: { quizId, status: "SUBMITTED" },
      select: { score: true, totalMarks: true },
    });

    if (attempts.length === 0) {
      return res.json({
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalMarks: 0,
      });
    }

    const scores = attempts.map((a) => a.score);
    const totalAttempts = attempts.length;
    const averageScore = Math.round(
      (scores.reduce((sum, s) => sum + s, 0) / totalAttempts) * 10
    ) / 10;

    return res.json({
      totalAttempts,
      averageScore,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      totalMarks: attempts[0].totalMarks,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = {
  startAttempt,
  submitAttempt,
  getAttemptResult,
  getMyAttempts,
  getLeaderboard,
  getQuizAnalytics,
};