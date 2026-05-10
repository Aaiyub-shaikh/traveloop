import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { PageLoader } from "./ui/Spinner.jsx";
import { PageSkeleton } from "./ui/Skeleton.jsx";
import { AppShell } from "./layout/AppShell.jsx";

/**
 * Gates authenticated app shell — redirects unauthenticated users to login.
 * Preserves intended path in location.state.from for post-login redirect.
 */
export function ProtectedAppShell() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader message="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <AppShell />;
}

/** Inline gate for a single branch (e.g. admin dashboard) */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

/** Requires JWT user with admin flag (or ADMIN_EMAILS match from API) */
export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageSkeleton />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
  }

  return children;
}
