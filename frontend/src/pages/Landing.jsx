import { Link } from "react-router-dom";
import { ArrowRight, Globe2, Map, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";

/** Public marketing landing — glass hero + feature cards */
export default function Landing() {
  return (
    <div className="min-h-screen travel-gradient dark:travel-gradient-dark">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <span className="font-display text-xl font-bold text-brand-700 dark:text-brand-300">Traveloop</span>
        <div className="flex gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:pt-16">
        <div className="glass-panel-strong relative overflow-hidden p-8 sm:p-12 lg:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
              <Sparkles className="h-3.5 w-3.5" />
              Trip planning, distilled
            </p>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Plan journeys with a calm, glass-clear workspace.
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
              Traveloop brings itineraries, budgets, packing, and notes into one modern canvas — starting with a secure account and a UI built for travel dreaming.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="gap-2">
                  Create account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  I already have an account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card>
            <Globe2 className="h-8 w-8 text-brand-500" />
            <h3 className="mt-4 font-display font-semibold text-slate-900 dark:text-white">City & activity discovery</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Search-ready screens with mock data today — wired experiences tomorrow.</p>
          </Card>
          <Card>
            <Map className="h-8 w-8 text-brand-500" />
            <h3 className="mt-4 font-display font-semibold text-slate-900 dark:text-white">Itinerary canvas</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Builder and viewer layouts are ready for your future scheduling logic.</p>
          </Card>
          <Card>
            <ShieldCheck className="h-8 w-8 text-brand-500" />
            <h3 className="mt-4 font-display font-semibold text-slate-900 dark:text-white">Secure accounts</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">JWT auth with PostgreSQL users — your foundation is production-shaped.</p>
          </Card>
        </div>
      </section>

      <footer className="border-t border-white/30 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        © {new Date().getFullYear()} Traveloop — UI preview; trip logic ships next.
      </footer>
    </div>
  );
}
