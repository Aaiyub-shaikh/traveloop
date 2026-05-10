# Traveloop

Full-stack travel planning app with PostgreSQL-backed users (JWT + bcrypt) and **trip CRUD** tied to each account.

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
│   │   └── schema.prisma        # User, Trip, Itinerary, Budget, Expense, …
│   └── src/
│       ├── server.js
│       ├── lib/
│       │   └── prisma.js
│       ├── middleware/
│       │   └── auth.js
│       ├── data/
│       │   ├── exploreCities.json
│       │   └── exploreActivities.json
│       └── routes/
│           ├── auth.js
│           ├── trips.js
│           ├── explore.js       # mock city/activity search
│           └── tripBudget.js    # budget + expenses
└── frontend/
    ├── .env.example
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── lib/
        │   ├── api.js           # authApi + tripsApi
        │   └── tripUtils.js
        ├── hooks/
        │   └── useDebouncedValue.js
        ├── components/
        │   ├── trips/
        │   │   └── TripCard.jsx
        │   └── ...
        └── pages/
            ├── CreateTrip.jsx
            ├── MyTrips.jsx
            ├── TripSummary.jsx
            ├── EditTrip.jsx
            └── ...
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
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to the backend.

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

## API

### Auth

- `POST /api/auth/register` — `{ name, email, password }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/me` — Bearer JWT

### Trips (Bearer JWT required)

- `POST /api/trips` — `{ title, description?, startDate, endDate, coverImage? }` (ISO dates)
- `GET /api/trips` — optional `?q=` search, `?filter=all|upcoming|past|current`
- `GET /api/trips/:id`
- `PUT /api/trips/:id` — same body shape as create
- `DELETE /api/trips/:id` — `204` empty body

### Itinerary & cities (Bearer JWT required)

- `GET /api/cities/search?q=&limit=` — worldwide substring search (`country-state-city` dataset; **min. 2 chars** on `q`)
- `GET /api/cities` — cities stored in DB (featured seed + auto-created when you add stops)
- `GET /api/trips/:tripId/itinerary` — `{ itinerary }` or `{ itinerary: null }`
- `POST /api/trips/:tripId/itinerary` — create (one per trip)
- `POST /api/itineraries/:itineraryId/stops` — `{ cityId?, worldCity?, startDate, endDate, notes? }` — either `cityId` or `worldCity: { name, countryCode, stateCode? }` from `/api/cities/search`
- `PUT /api/itineraries/:itineraryId/stops/reorder` — `{ orderedStopIds: string[] }`
- `PUT /api/stops/:stopId` — partial `{ cityId?, worldCity?, startDate?, endDate?, notes? }`
- `DELETE /api/stops/:stopId` — `204`
- `POST /api/stops/:stopId/activities` — `{ title, description?, startsAt? }`
- `PUT /api/stops/:stopId/activities/reorder` — `{ orderedActivityIds: string[] }`
- `PUT /api/activities/:activityId` — partial fields
- `DELETE /api/activities/:activityId` — `204`

Seed featured cities: `cd backend && npm run db:seed` (after `prisma db push`). Any other place from search is created in the DB on first use (`worldKey`). The `country-state-city` npm package is GPL-3.0 — review license terms for your distribution model.

### Explore — mock catalog (Bearer JWT, static JSON, no paid APIs)

- `GET /api/explore/cities/meta` — `{ countries, regions }` for filters
- `GET /api/explore/cities?q=&country=&region=` — card data includes `imageUrl` (picsum.photos seeds)
- `GET /api/explore/activities/meta` — `{ categories, costTiers }`
- `GET /api/explore/activities?q=&category=&costTier=`

### Budget (Bearer JWT)

- `GET /api/trips/:tripId/budget` — `{ budget, expenses, summary }` — creates budget if missing; **summary** includes `pieData`, `barData`, `avgPerDay`, `alerts`
- `PUT /api/trips/:tripId/budget` — `{ currency?, totalLimit?, alertAtPercent? }`
- `POST /api/trips/:tripId/budget/expenses` — `{ category: hotel|transport|food|activities, amount, label, notes? }`
- `DELETE /api/trips/:tripId/budget/expenses/:expenseId`

## Notes

- Shared itinerary `/shared/:token` stays public (preview).
- Other shell routes require JWT in `localStorage` as `traveloop_token`.
- After schema changes, run `npx prisma db push` again.
