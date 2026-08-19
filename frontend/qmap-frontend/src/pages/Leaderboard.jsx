import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Leaderboard() {
  const { quizId } = useParams();
  const [rows, setRows] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/quizzes/${quizId}/leaderboard`).then((res) => setRows(res.data));
  }, [quizId]);

  const backTo = user?.role === "ADMIN" ? "/admin" : "/student";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-lg mx-auto p-6">
        <Link to={backTo} className="text-sm text-slate-500 hover:underline">← Back</Link>
        <h1 className="text-xl font-semibold text-slate-800 mt-2 mb-4">Leaderboard</h1>

        {rows.length === 0 ? (
          <p className="text-slate-500">No attempts yet.</p>
        ) : (
          <div className="bg-white rounded-lg shadow-sm divide-y">
            {rows.map((r) => (
              <div key={r.rank} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-slate-400 font-medium">{r.rank}</span>
                  <span className="text-slate-800">{r.name}</span>
                </div>
                <span className="text-slate-600 font-medium">{r.score} / {r.totalMarks}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
