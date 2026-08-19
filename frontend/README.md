# Quiz Management & Online Assessment Platform — Frontend

React (Vite) + Tailwind CSS + React Router + Axios.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure the backend (`qmap-backend`) is running on `http://localhost:5000` first — the API base URL is set in `src/api/axios.js`. Change it there if your backend runs elsewhere.

3. Start the dev server:
   ```
   npm run dev
   ```
   Opens on `http://localhost:5173` by default.

## Flow
- Register as Admin or Student on the `/register` page.
- **Admin** -> create quizzes, add questions, publish/unpublish, delete, view leaderboard.
- **Student** -> see published quizzes, attempt one (countdown timer, auto-submits when time runs out), view score + answer review, view leaderboard.

## Structure
```
src/
  api/axios.js            -> shared axios instance, auto-attaches JWT
  context/AuthContext.jsx -> login/register/logout state
  components/             -> Navbar, ProtectedRoute
  pages/
    Login.jsx, Register.jsx, Leaderboard.jsx
    admin/AdminDashboard.jsx, admin/ManageQuiz.jsx
    student/StudentDashboard.jsx, student/AttemptQuiz.jsx, student/Result.jsx
```

Kept intentionally simple - no state management library, no UI kit, just Tailwind utility classes and plain React state/context.
