# Traveloop

Full-stack travel planning UI shell with PostgreSQL-backed user accounts (JWT + bcrypt). Trip planning features use mock data until backend APIs are added.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local or hosted)

## Folder structure

```
traveloop/
├── README.md
├── .gitignore
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma        # User model only (this phase)
│   └── src/
│       ├── server.js            # Express app + CORS
│       ├── lib/
│       │   └── prisma.js        # Prisma singleton
│       ├── middleware/
│       │   └── auth.js          # JWT Bearer middleware
│       └── routes/
│           └── auth.js          # register, login, /me
└── frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js           # Dev proxy → backend /api
    ├── public/
    └── src/
        ├── App.jsx              # Routes
        ├── main.jsx
        ├── index.css
        ├── contexts/            # Auth + theme (Context API)
        ├── data/
        │   └── mockData.js      # Dummy trips, cities, activities
        ├── lib/
        │   └── api.js           # fetch helper + auth endpoints
        ├── components/
        │   ├── layout/          # Navbar, Sidebar, AppShell
        │   ├── ui/              # Button, Card, Input, etc.
        │   └── ProtectedRoute.jsx
        └── pages/               # All screens (UI placeholders + forms)
```

## Setup

### 1. Database

Create a database (example name: `traveloop`), then set `DATABASE_URL` in `backend/.env`.

### 2. Backend

```powershell
cd backend
copy .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET (long random string), PORT (optional)
npm install
npx prisma db push
npm run dev
```

API listens on `http://localhost:5000` by default. Health check: `GET http://localhost:5000/api/health`.

### 3. Frontend

```powershell
cd frontend
copy .env.example .env
# Optional: VITE_API_URL if not using Vite proxy
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to the backend (`vite.config.js`).

## Commands

| Location   | Command        | Purpose                          |
|-----------|----------------|----------------------------------|
| `backend` | `npm run dev`  | API with `--watch`               |
| `backend` | `npm start`    | Production-style run             |
| `backend` | `npx prisma db push` | Sync schema to DB          |
| `backend` | `npm run db:studio`  | Prisma Studio               |
| `frontend`| `npm run dev`  | Vite dev server                  |
| `frontend`| `npm run build`| Production bundle                |
| `frontend`| `npm run preview` | Preview production build       |

## API (this phase)

- `POST /api/auth/register` — `{ name, email, password }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/me` — Bearer JWT, returns user

## Notes

- Shared itinerary route `/shared/:token` is public (no login) for preview links.
- All other app routes under the shell require a valid JWT stored in `localStorage` as `traveloop_token`.
