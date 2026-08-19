import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
      <span className="font-semibold text-lg">Quiz Platform</span>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-300">
            {user.name} · {user.role}
          </span>
          <button
            onClick={handleLogout}
            className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
