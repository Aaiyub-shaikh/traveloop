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
## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/traveloop.git
cd traveloop
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

## 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_secret_key
ADMIN_EMAILS=admin_email_@gmail.com
PORT=5000
```

## 🗄️ Prisma Setup

```bash
npx prisma migrate dev
npx prisma generate
```

## 🎯 Goals of the Project

- Simplify the process of travel planning
- Help users organize multi-city trips easily
- Provide a clean and interactive itinerary experience
- Allow users to track estimated travel budgets
- Create a responsive and user-friendly interface
- Improve trip management and accessibility
- Build a scalable full-stack web application
- Encourage collaborative and smarter travel planning

---

## 📌 Future Improvements

- AI-powered travel recommendations
- Real-time weather integration
- Google Maps and location services
- Hotel and flight booking integration
- Collaborative group trip planning
- Expense splitting between travelers
- Offline itinerary access
- Mobile application support
- Smart budget optimization
- Personalized activity suggestions
- Real-time chat and sharing features
- Multi-language support