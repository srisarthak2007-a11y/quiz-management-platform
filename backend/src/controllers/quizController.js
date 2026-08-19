const prisma = require("../utils/prismaClient");

// POST /api/quizzes  (Admin only)
async function createQuiz(req, res) {
  try {
    const { title, description, durationMinutes } = req.body;

    if (!title || !durationMinutes) {
      return res.status(400).json({ message: "title and durationMinutes are required" });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        durationMinutes,
        createdBy: req.user.id,
      },
    });

    return res.status(201).json(quiz);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// GET /api/quizzes  (Admin: all quizzes | Student: only published ones)
async function getQuizzes(req, res) {
  try {
    const where = req.user.role === "ADMIN" ? {} : { isPublished: true };

    const quizzes = await prisma.quiz.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        durationMinutes: true,
        isPublished: true,
        createdAt: true,
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(quizzes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// GET /api/quizzes/:id  (quiz detail with questions; students never see correctOption)
async function getQuizById(req, res) {
  try {
    const quizId = Number(req.params.id);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (req.user.role !== "ADMIN") {
      quiz.questions = quiz.questions.map(({ correctOption, ...rest }) => rest);
    }

    return res.json(quiz);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// PUT /api/quizzes/:id  (Admin only)
async function updateQuiz(req, res) {
  try {
    const quizId = Number(req.params.id);
    const { title, description, durationMinutes, isPublished } = req.body;

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: { title, description, durationMinutes, isPublished },
    });

    return res.json(quiz);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// DELETE /api/quizzes/:id  (Admin only)
async function deleteQuiz(req, res) {
  try {
    const quizId = Number(req.params.id);
    await prisma.quiz.delete({ where: { id: quizId } });
    return res.json({ message: "Quiz deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz };
