import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedAppShell } from "./components/ProtectedRoute.jsx";
import { SimpleLayout } from "./components/layout/SimpleLayout.jsx";
import ActivitySearch from "./pages/ActivitySearch.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Budget from "./pages/Budget.jsx";
import CitySearch from "./pages/CitySearch.jsx";
import CreateTrip from "./pages/CreateTrip.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ItineraryBuilder from "./pages/ItineraryBuilder.jsx";
import ItineraryView from "./pages/ItineraryView.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import MyTrips from "./pages/MyTrips.jsx";
import NotesJournal from "./pages/NotesJournal.jsx";
import PackingChecklist from "./pages/PackingChecklist.jsx";
import ProfileSettings from "./pages/ProfileSettings.jsx";
import SharedItinerary from "./pages/SharedItinerary.jsx";
import Signup from "./pages/Signup.jsx";

/** Central route table — public routes + JWT-guarded app shell */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<SimpleLayout />}>
        <Route path="/shared/:token" element={<SharedItinerary />} />
      </Route>

      <Route element={<ProtectedAppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trips/create" element={<CreateTrip />} />
        <Route path="/trips" element={<MyTrips />} />
        <Route path="/itinerary/:tripId/build" element={<ItineraryBuilder />} />
        <Route path="/itinerary/:tripId" element={<ItineraryView />} />
        <Route path="/search/cities" element={<CitySearch />} />
        <Route path="/search/activities" element={<ActivitySearch />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/packing" element={<PackingChecklist />} />
        <Route path="/notes" element={<NotesJournal />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
