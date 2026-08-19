# Quiz Management & Online Assessment Platform — Backend

Simple, clean REST API for a quiz platform with two roles: **Admin** and **Student**.

## Tech Stack
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT auth + bcrypt password hashing

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your PostgreSQL connection string (Render, Supabase, Neon — any free Postgres works) and a JWT secret:
   ```
   cp .env.example .env
   ```

3. Run the migration to create tables in your DB:
   ```
   npx prisma migrate dev --name init
   ```

4. Start the server:
   ```
   npm run dev
   ```
   Server runs on `http://localhost:5000` by default.

## Roles
- First user to register with `"role": "ADMIN"` in the request body becomes an Admin. Everyone else defaults to `STUDENT`.
- In a real deployment you'd lock down who can register as Admin — for a portfolio project, this is enough.

## API Overview

### Auth
| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |

### Quizzes
| Method | Route | Access |
|---|---|---|
| GET | `/api/quizzes` | Logged in (Admin sees all, Student sees published only) |
| GET | `/api/quizzes/:id` | Logged in (Student never sees correct answers) |
| POST | `/api/quizzes` | Admin |
| PUT | `/api/quizzes/:id` | Admin |
| DELETE | `/api/quizzes/:id` | Admin |
| GET | `/api/quizzes/:quizId/leaderboard` | Logged in |

### Questions
| Method | Route | Access |
|---|---|---|
| POST | `/api/quizzes/:quizId/questions` | Admin |
| PUT | `/api/quizzes/questions/:id` | Admin |
| DELETE | `/api/quizzes/questions/:id` | Admin |

### Attempts
| Method | Route | Access |
|---|---|---|
| POST | `/api/attempts/start` | Student — body: `{ quizId }` |
| POST | `/api/attempts/:id/submit` | Student — body: `{ answers: [{ questionId, selectedOption }] }` |
| GET | `/api/attempts/my` | Student — own attempt history |
| GET | `/api/attempts/:id` | Owner or Admin — full result + answer review |

## Notes
- Scoring is automatic: on submit, each answer is checked against the question's `correctOption` and the total score is calculated server-side (never trust the frontend for scoring).
- Timer (`durationMinutes`) is enforced on the frontend UI; the backend just stores it — you can add a server-side time check later if needed, but it's not required for a clean v1.
- Kept to 5 database tables on purpose (User, Quiz, Question, Attempt, Answer) — no unnecessary nesting or extra tables.
