import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute, ProtectedAppShell } from "../components/ProtectedRoute.jsx";
import { SimpleLayout } from "../components/layout/SimpleLayout.jsx";
import { PageSkeleton } from "../components/ui/Skeleton.jsx";

const Landing = lazy(() => import("../pages/Landing.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const Signup = lazy(() => import("../pages/Signup.jsx"));
const SharedItinerary = lazy(() => import("../pages/SharedItinerary.jsx"));

const Dashboard = lazy(() => import("../pages/Dashboard.jsx"));
const CreateTrip = lazy(() => import("../pages/CreateTrip.jsx"));
const EditTrip = lazy(() => import("../pages/EditTrip.jsx"));
const TripSummary = lazy(() => import("../pages/TripSummary.jsx"));
const MyTrips = lazy(() => import("../pages/MyTrips.jsx"));
const ItineraryBuilder = lazy(() => import("../pages/ItineraryBuilder.jsx"));
const ItineraryView = lazy(() => import("../pages/ItineraryView.jsx"));
const CitySearch = lazy(() => import("../pages/CitySearch.jsx"));
const ActivitySearch = lazy(() => import("../pages/ActivitySearch.jsx"));
const Budget = lazy(() => import("../pages/Budget.jsx"));
const PackingChecklist = lazy(() => import("../pages/PackingChecklist.jsx"));
const NotesJournal = lazy(() => import("../pages/NotesJournal.jsx"));
const ProfileSettings = lazy(() => import("../pages/ProfileSettings.jsx"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard.jsx"));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
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
          <Route path="/trips/:tripId/edit" element={<EditTrip />} />
          <Route path="/trips/:tripId" element={<TripSummary />} />
          <Route path="/trips" element={<MyTrips />} />
          <Route path="/itinerary/:tripId/build" element={<ItineraryBuilder />} />
          <Route path="/itinerary/:tripId" element={<ItineraryView />} />
          <Route path="/search/cities" element={<CitySearch />} />
          <Route path="/search/activities" element={<ActivitySearch />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/packing" element={<PackingChecklist />} />
          <Route path="/notes" element={<NotesJournal />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
