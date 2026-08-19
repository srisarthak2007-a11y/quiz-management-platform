import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", durationMinutes: 10 });
  const [error, setError] = useState("");

  async function loadQuizzes() {
    const res = await api.get("/quizzes");
    setQuizzes(res.data);
  }

  useEffect(() => {
    loadQuizzes();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/quizzes", form);
      setForm({ title: "", description: "", durationMinutes: 10 });
      loadQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create quiz");
    }
  }

  async function togglePublish(quiz) {
    await api.put(`/quizzes/${quiz.id}`, { isPublished: !quiz.isPublished });
    loadQuizzes();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this quiz?")) return;
    await api.delete(`/quizzes/${id}`);
    loadQuizzes();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-4">Create a Quiz</h1>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm p-2 rounded mb-4">{error}</p>
        )}

        <form onSubmit={handleCreate} className="bg-white p-5 rounded-lg shadow-sm mb-8 space-y-3">
          <input
            placeholder="Quiz title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            min={1}
            placeholder="Duration (minutes)"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
            required
            className="w-full border rounded px-3 py-2"
          />
          <button className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800">
            Create Quiz
          </button>
        </form>

        <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Quizzes</h2>
        <div className="space-y-3">
          {quizzes.length === 0 && <p className="text-slate-500">No quizzes yet.</p>}
          {quizzes.map((q) => (
            <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">{q.title}</p>
                <p className="text-sm text-slate-500">
                  {q._count?.questions ?? 0} questions · {q.durationMinutes} min ·{" "}
                  <span className={q.isPublished ? "text-green-600" : "text-amber-600"}>
                    {q.isPublished ? "Published" : "Draft"}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/admin/quizzes/${q.id}`}
                  className="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded"
                >
                  Manage
                </Link>
                <button
                  onClick={() => togglePublish(q)}
                  className="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded"
                >
                  {q.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
