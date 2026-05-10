import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar.jsx";
import { Sidebar } from "./Sidebar.jsx";

/**
 * Authenticated layout: top navbar + collapsible sidebar (mobile drawer)
 */
export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen travel-gradient dark:travel-gradient-dark">
      <Navbar showMenu onMenuClick={() => setSidebarOpen(true)} />

      <div className="mx-auto flex max-w-[1600px]">
        {/* Desktop sidebar */}
        <div className="sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 lg:block">
          <Sidebar />
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`fixed bottom-0 left-0 top-16 z-50 w-64 transform transition-transform lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </div>

        <main className="min-h-[calc(100vh-4rem)] flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
