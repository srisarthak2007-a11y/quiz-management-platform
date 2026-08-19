import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";

export default function AttemptQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: "A" }
  const [secondsLeft, setSecondsLeft] = useState(null);
  const submittedRef = useRef(false);

  // Start the attempt and load quiz questions once
  useEffect(() => {
    async function start() {
      const startRes = await api.post("/attempts/start", { quizId: Number(quizId) });
      setAttemptId(startRes.data.attemptId);
      setSecondsLeft(startRes.data.durationMinutes * 60);

      const quizRes = await api.get(`/quizzes/${quizId}`);
      setQuiz(quizRes.data);
    }
    start();
  }, [quizId]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  function selectOption(questionId, option) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  async function handleSubmit() {
    if (submittedRef.current || !attemptId) return;
    submittedRef.current = true;

    const payload = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId: Number(questionId),
      selectedOption,
    }));

    await api.post(`/attempts/${attemptId}/submit`, { answers: payload });
    navigate(`/results/${attemptId}`);
  }

  if (!quiz || secondsLeft === null) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <p className="text-center mt-10 text-slate-500">Loading quiz...</p>
      </div>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-50 py-2">
          <h1 className="text-xl font-semibold text-slate-800">{quiz.title}</h1>
          <span className="font-mono text-lg bg-slate-900 text-white px-3 py-1 rounded">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>

        <div className="space-y-4">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm">
              <p className="font-medium text-slate-800 mb-3">{i + 1}. {q.questionText}</p>
              <div className="space-y-2">
                {["A", "B", "C", "D"].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer ${
                      answers[q.id] === opt ? "border-slate-900 bg-slate-50" : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === opt}
                      onChange={() => selectOption(q.id, opt)}
                    />
                    {q[`option${opt}`]}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-slate-900 text-white py-3 rounded mt-6 hover:bg-slate-800"
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
}
