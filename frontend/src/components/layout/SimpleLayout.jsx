import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar.jsx";

/** Lightweight layout for public pages that still need the main nav (e.g. shared itinerary). */
export function SimpleLayout() {
  return (
    <div className="relative min-h-screen travel-gradient dark:travel-gradient-dark">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
