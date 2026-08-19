import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";

const emptyQuestion = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  marks: 1,
};

export default function ManageQuiz() {
  const { id } = useParams();
 const [quiz, setQuiz] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [form, setForm] = useState(emptyQuestion);
  const [error, setError] = useState("");

  async function loadQuiz() {
    const res = await api.get(`/quizzes/${id}`);
    setQuiz(res.data);
  }

  async function loadAnalytics() {
    const res = await api.get(`/quizzes/${id}/analytics`);
    setAnalytics(res.data);
  }

  useEffect(() => {
    loadQuiz();
    loadAnalytics();
  }, [id]);

  async function handleAddQuestion(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/quizzes/${id}/questions`, form);
      setForm(emptyQuestion);
      loadQuiz();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add question");
    }
  }

  async function handleDeleteQuestion(qid) {
    if (!confirm("Delete this question?")) return;
    await api.delete(`/quizzes/questions/${qid}`);
    loadQuiz();
  }

  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <Link to="/admin" className="text-sm text-slate-500 hover:underline">← Back to quizzes</Link>
      <h1 className="text-xl font-semibold text-slate-800 mt-2 mb-1">{quiz.title}</h1>
        <p className="text-sm text-slate-500 mb-4">{quiz.description}</p>

        {analytics && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-slate-800">{analytics.totalAttempts}</p>
              <p className="text-xs text-slate-500">Attempts</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-800">
                {analytics.averageScore} / {analytics.totalMarks}
              </p>
              <p className="text-xs text-slate-500">Average score</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-green-600">{analytics.highestScore}</p>
              <p className="text-xs text-slate-500">Highest score</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-amber-600">{analytics.lowestScore}</p>
              <p className="text-xs text-slate-500">Lowest score</p>
            </div>
          </div>
        )}

        <h2 className="font-medium text-slate-700 mb-3">Add a Question</h2>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm p-2 rounded mb-4">{error}</p>
        )}

        <form onSubmit={handleAddQuestion} className="bg-white p-5 rounded-lg shadow-sm mb-8 space-y-3">
          <input
            placeholder="Question text"
            value={form.questionText}
            onChange={(e) => setForm({ ...form, questionText: e.target.value })}
            required
            className="w-full border rounded px-3 py-2"
          />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Option A" value={form.optionA} onChange={(e) => setForm({ ...form, optionA: e.target.value })} required className="border rounded px-3 py-2" />
            <input placeholder="Option B" value={form.optionB} onChange={(e) => setForm({ ...form, optionB: e.target.value })} required className="border rounded px-3 py-2" />
            <input placeholder="Option C" value={form.optionC} onChange={(e) => setForm({ ...form, optionC: e.target.value })} required className="border rounded px-3 py-2" />
            <input placeholder="Option D" value={form.optionD} onChange={(e) => setForm({ ...form, optionD: e.target.value })} required className="border rounded px-3 py-2" />
          </div>
          <div className="flex gap-3 items-center">
            <label className="text-sm text-slate-600">Correct option</label>
            <select
              value={form.correctOption}
              onChange={(e) => setForm({ ...form, correctOption: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
            <label className="text-sm text-slate-600">Marks</label>
            <input
              type="number"
              min={1}
              value={form.marks}
              onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })}
              className="border rounded px-3 py-2 w-20"
            />
          </div>
          <button className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800">
            Add Question
          </button>
        </form>

        <h2 className="font-medium text-slate-700 mb-3">Questions ({quiz.questions.length})</h2>
        <div className="space-y-3">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <p className="font-medium text-slate-800">{i + 1}. {q.questionText}</p>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
              <div className="text-sm text-slate-600 mt-1 grid grid-cols-2 gap-1">
                <span className={q.correctOption === "A" ? "text-green-600 font-medium" : ""}>A. {q.optionA}</span>
                <span className={q.correctOption === "B" ? "text-green-600 font-medium" : ""}>B. {q.optionB}</span>
                <span className={q.correctOption === "C" ? "text-green-600 font-medium" : ""}>C. {q.optionC}</span>
                <span className={q.correctOption === "D" ? "text-green-600 font-medium" : ""}>D. {q.optionD}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
