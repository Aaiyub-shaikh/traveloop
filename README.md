# Traveloop 🌍✈️

Traveloop is a smart travel planning web application built to simplify the process of organizing trips. The platform helps users create personalized itineraries, manage travel plans, track budgets, and explore destinations in one place.

This project was developed as part of a hackathon selection challenge with the goal of creating a clean, user-friendly, and scalable travel planning experience.

---

## 🚀 Features

### Authentication
- User Signup & Login
- JWT-based Authentication
- Protected Routes

### Trip Management
- Create and manage trips
- Multi-city itinerary support
- Edit/Delete trips
- Trip timeline view

### Itinerary Builder
- Add travel stops
- Add activities for each city
- Day-wise trip planning
- Reorder itinerary stops

### Budget Management
- Expense breakdown
- Daily average cost
- Budget visualization charts

### User Features
- Profile & Settings
- Saved destinations
- Packing checklist
- Trip notes/journal

### Sharing
- Public trip sharing
- Read-only itinerary links

---

## 🛠️ Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL
- Prisma ORM

### Authentication
- JWT
- bcrypt

---

## 📂 Project Structure

```bash
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
⚙️ Installation
Clone the Repository
git clone https://github.com/your-username/traveloop.git
cd traveloop
Frontend Setup
cd frontend
npm install
npm run dev
Backend Setup
cd backend
npm install
npm run dev
🔑 Environment Variables

Create a .env file inside the backend folder.

DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_secret_key
ADMIN_EMAILS=email@gmail.com
PORT=5000
🗄️ Prisma Setup
npx prisma migrate dev
npx prisma generate

🎯 Goals of the Project
Simplify travel planning
Improve itinerary organization
Provide budget visibility
Create a smooth and responsive user experience
Build a scalable full-stack application

📌 Future Improvements
AI-based trip recommendations
Real-time weather integration
Google Maps integration
Hotel & flight APIs
Collaborative group trip planning