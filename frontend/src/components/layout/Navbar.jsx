import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, Plane, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { Button } from "../ui/Button.jsx";

export function Navbar({ onMenuClick, showMenu }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-white/30 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {showMenu && (
            <button
              type="button"
              className="rounded-xl p-2 text-slate-600 hover:bg-white/70 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800/70"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-brand-700 dark:text-brand-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/30">
              <Plane className="h-5 w-5" />
            </span>
            Traveloop
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
            Home
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-800/70"
            title="Toggle theme"
          >
            Theme
          </button>
          {isAuthenticated ? (
            <>
              <span className="hidden max-w-[140px] truncate text-sm text-slate-600 dark:text-slate-400 sm:inline">{user?.name}</span>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate("/profile")}>
                <User className="h-4 w-4" />
                Profile
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
