import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";

export default function Result() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    api.get(`/attempts/${attemptId}`).then((res) => setAttempt(res.data));
  }, [attemptId]);

  if (!attempt) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <Link to="/student" className="text-sm text-slate-500 hover:underline">← Back to dashboard</Link>

        <div className="bg-white p-6 rounded-lg shadow-sm mt-3 mb-6 text-center">
          <p className="text-slate-500 text-sm">{attempt.quiz.title}</p>
          <p className="text-3xl font-semibold text-slate-800 mt-1">
            {attempt.score} / {attempt.totalMarks}
          </p>
        </div>

        <h2 className="font-medium text-slate-700 mb-3">Answer Review</h2>
        <div className="space-y-3">
          {attempt.answers.map((a, i) => (
            <div key={a.id} className="bg-white p-4 rounded-lg shadow-sm">
              <p className="font-medium text-slate-800 mb-2">{i + 1}. {a.question.questionText}</p>
              <div className="text-sm space-y-1">
                {["A", "B", "C", "D"].map((opt) => {
                  const isCorrect = a.question.correctOption === opt;
                  const isSelected = a.selectedOption === opt;
                  return (
                    <p
                      key={opt}
                      className={
                        isCorrect
                          ? "text-green-600 font-medium"
                          : isSelected
                          ? "text-red-600 font-medium"
                          : "text-slate-600"
                      }
                    >
                      {opt}. {a.question[`option${opt}`]}
                      {isCorrect && " ✓ correct"}
                      {isSelected && !isCorrect && " ✗ your answer"}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
