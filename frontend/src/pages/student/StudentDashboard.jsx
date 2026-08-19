import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";

export default function StudentDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);

  useEffect(() => {
    api.get("/quizzes").then((res) => setQuizzes(res.data));
    api.get("/attempts/my").then((res) => setMyAttempts(res.data));
  }, []);

  const attemptedQuizIds = new Set(myAttempts.map((a) => a.quizId));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-4">Available Quizzes</h1>
        <div className="space-y-3">
          {quizzes.length === 0 && <p className="text-slate-500">No quizzes available right now.</p>}
          {quizzes.map((q) => {
            const done = attemptedQuizIds.has(q.id);
            return (
              <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">{q.title}</p>
                  <p className="text-sm text-slate-500">
                    {q._count?.questions ?? 0} questions · {q.durationMinutes} min
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/quizzes/${q.id}/leaderboard`}
                    className="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded"
                  >
                    Leaderboard
                  </Link>
                  {done ? (
                    <span className="text-sm text-slate-400 px-3 py-1.5">Attempted</span>
                  ) : (
                    <Link
                      to={`/attempt/${q.id}`}
                      className="text-sm bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded"
                    >
                      Start Quiz
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {myAttempts.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">Your Results</h2>
            <div className="space-y-3">
              {myAttempts.map((a) => (
                <Link
                  key={a.id}
                  to={`/results/${a.id}`}
                  className="block bg-white p-4 rounded-lg shadow-sm hover:shadow"
                >
                  <p className="font-medium text-slate-800">{a.quiz.title}</p>
                  <p className="text-sm text-slate-500">Score: {a.score} / {a.totalMarks}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
