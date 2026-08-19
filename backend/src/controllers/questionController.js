const prisma = require("../utils/prismaClient");

// POST /api/quizzes/:quizId/questions  (Admin only)
async function addQuestion(req, res) {
  try {
    const quizId = Number(req.params.quizId);
    const { questionText, optionA, optionB, optionC, optionD, correctOption, marks } = req.body;

    if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctOption) {
      return res.status(400).json({ message: "All question fields are required" });
    }

    const question = await prisma.question.create({
      data: {
        quizId,
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption, // "A" | "B" | "C" | "D"
        marks: marks || 1,
      },
    });

    return res.status(201).json(question);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// PUT /api/questions/:id  (Admin only)
async function updateQuestion(req, res) {
  try {
    const id = Number(req.params.id);
    const { questionText, optionA, optionB, optionC, optionD, correctOption, marks } = req.body;

    const question = await prisma.question.update({
      where: { id },
      data: { questionText, optionA, optionB, optionC, optionD, correctOption, marks },
    });

    return res.json(question);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// DELETE /api/questions/:id  (Admin only)
async function deleteQuestion(req, res) {
  try {
    const id = Number(req.params.id);
    await prisma.question.delete({ where: { id } });
    return res.json({ message: "Question deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { addQuestion, updateQuestion, deleteQuestion };
