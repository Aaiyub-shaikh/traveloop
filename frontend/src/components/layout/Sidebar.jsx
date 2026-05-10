import { NavLink } from "react-router-dom";
import {
  Briefcase,
  CalendarRange,
  ClipboardList,
  Coins,
  LayoutDashboard,
  MapPin,
  NotebookPen,
  Plane,
  Search,
  Share2,
  Shield,
  Sparkles,
  TentTree,
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trips/create", label: "Create Trip", icon: Plane },
  { to: "/trips", label: "My Trips", icon: CalendarRange },
  { to: "/search/cities", label: "City Search", icon: MapPin },
  { to: "/search/activities", label: "Activity Search", icon: Search },
  { to: "/budget", label: "Budget", icon: Coins },
  { to: "/packing", label: "Packing", icon: ClipboardList },
  { to: "/notes", label: "Notes / Journal", icon: NotebookPen },
  { to: "/shared/demo", label: "Shared Itinerary", icon: Share2 },
  { to: "/admin", label: "Admin", icon: Shield },
];

/** Desktop sidebar + shared nav definitions */
export function Sidebar({ onNavigate }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? "bg-brand-500/15 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200"
        : "text-slate-600 hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-800/70"
    }`;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/30 bg-white/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50">
      <div className="border-b border-white/30 px-4 py-4 dark:border-white/10">
        <p className="font-display text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Plan</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Trip workspace</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={onNavigate}>
            <Icon className="h-4 w-4 shrink-0 opacity-80" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/30 p-4 dark:border-white/10">
        <div className="glass-panel flex items-start gap-2 p-3">
          <Sparkles className="mt-0.5 h-4 w-4 text-brand-500" />
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Itinerary builder</p>
            <NavLink to="/trips" className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline dark:text-brand-400" onClick={onNavigate}>
              <TentTree className="h-3 w-3" />
              Pick a trip first
            </NavLink>
          </div>
        </div>
        <NavLink
          to="/trips"
          className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-800/70"
          onClick={onNavigate}
        >
          <Briefcase className="h-4 w-4" />
          My trips → itinerary
        </NavLink>
      </div>
    </aside>
  );
}
