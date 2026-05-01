# TaskFlow — Team Task Manager

A production-quality full-stack Team Task Manager built with React, Node.js, Express, and MongoDB.

## ✨ Features

- **Authentication** — JWT-based signup/login with bcrypt password hashing
- **Role-Based Access Control** — Admin vs Member roles per project
- **Project Management** — Create projects, invite members, track progress
- **Kanban Board** — Drag-and-drop tasks between Todo / In Progress / Done
- **Task Management** — Priority, due dates, assignees, comments, tags
- **Dashboard** — Stats cards + Recharts visualizations
- **Notifications** — In-app notifications for task assignment/updates (polling)
- **Activity Log** — Per-project audit trail
- **Dark Mode** — Full dark/light theme toggle
- **Responsive** — Mobile-friendly sidebar layout

---

## 🏗 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, TailwindCSS v4 |
| State | TanStack Query + Zustand |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Charts | Recharts |
| DnD | @dnd-kit |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier) or local MongoDB

### 1. Clone the repo

```bash
git clone <repo-url>
cd Task_Manager
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

The API will run at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will run at `http://localhost:5173`.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for signing JWTs | 64-char random string |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

---

## 📡 API Documentation

Base URL: `http://localhost:5000/api`

All authenticated routes require: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Login |
| GET | `/auth/me` | Yes | Get current user |
| PUT | `/auth/profile` | Yes | Update profile |
| PUT | `/auth/password` | Yes | Change password |

### Projects

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/projects` | Yes | List user's projects |
| POST | `/projects` | Yes | Create project |
| GET | `/projects/:id` | Yes | Get project + tasks |
| PUT | `/projects/:id` | Admin | Update project |
| DELETE | `/projects/:id` | Admin | Delete project |
| POST | `/projects/:id/members` | Admin | Add member |
| DELETE | `/projects/:id/members/:userId` | Admin | Remove member |
| GET | `/projects/:id/activity` | Yes | Activity log |

### Tasks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/tasks` | Yes | List tasks (filterable) |
| POST | `/tasks` | Yes | Create task |
| GET | `/tasks/:id` | Yes | Get task |
| PUT | `/tasks/:id` | Yes | Update task |
| DELETE | `/tasks/:id` | Yes | Delete task |
| POST | `/tasks/:id/comments` | Yes | Add comment |
| GET | `/tasks/dashboard` | Yes | Dashboard stats |

**Query params for GET /tasks:** `projectId`, `status`, `priority`, `assignee` (`me` or userId), `search`, `page`, `limit`

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users` | Yes | List users (searchable) |
| GET | `/users/:id` | Yes | Get user by ID |

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | Yes | Get notifications |
| PUT | `/notifications/read-all` | Yes | Mark all read |
| PUT | `/notifications/:id/read` | Yes | Mark one read |
| DELETE | `/notifications/:id` | Yes | Delete notification |

---

## 🚢 Deployment (Railway + MongoDB Atlas + Vercel)

### MongoDB Atlas (free)
1. Create account at mongodb.com/atlas
2. Create a free M0 cluster
3. Add database user and whitelist `0.0.0.0/0`
4. Copy the connection string

### Backend on Railway
1. Connect GitHub repo to Railway
2. Set root directory to `/backend`
3. Add environment variables from `.env`
4. Set `CLIENT_URL` to your Vercel frontend URL

### Frontend on Vercel
1. Connect GitHub repo to Vercel
2. Set root directory to `/frontend`
3. Add env var: `VITE_API_URL=https://your-railway-backend.railway.app/api`

> **Note:** Update `src/lib/api.js` `baseURL` to use `import.meta.env.VITE_API_URL || '/api'` for production.

---

## 📁 Project Structure

```
Task_Manager/
├── backend/
│   ├── server.js                 # Entry point
│   └── src/
│       ├── config/db.js          # MongoDB connection
│       ├── controllers/          # Route handlers
│       ├── middleware/           # Auth, RBAC, error handling
│       ├── models/               # Mongoose schemas
│       ├── routes/               # Express routers
│       ├── services/             # Notification & activity services
│       └── utils/                # Response helpers
└── frontend/
    └── src/
        ├── api/                  # Axios API calls
        ├── components/
        │   ├── ui/               # Primitive UI components
        │   ├── layout/           # Sidebar, Navbar, Layout
        │   ├── tasks/            # KanbanBoard, TaskCard, TaskModal
        │   ├── projects/         # ProjectCard
        │   ├── dashboard/        # StatsCard
        │   ├── notifications/    # NotificationPanel
        │   └── common/           # EmptyState, Skeletons
        ├── pages/                # Route pages
        ├── store/                # Zustand stores
        └── lib/                  # Utilities, API client
```
