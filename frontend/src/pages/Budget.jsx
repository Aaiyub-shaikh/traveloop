import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { AlertTriangle, CheckCircle2, Info, PiggyBank, TrendingUp } from "lucide-react";
import { budgetApi, tripsApi } from "../lib/api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { PageLoader } from "../components/ui/Spinner.jsx";

const PIE_COLORS = ["#06b6d4", "#0891b2", "#22d3ee", "#0e7490"];
const EXPENSE_CATS = [
  { value: "hotel", label: "Hotel" },
  { value: "transport", label: "Transport" },
  { value: "food", label: "Food" },
  { value: "activities", label: "Activities" },
];

/** Trip budget — stored expenses + charts + alerts (mock rollups from API) */
export default function Budget() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryPrefillDone = useRef(false);
  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState("");
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [error, setError] = useState("");
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);

  const [limitInput, setLimitInput] = useState("");
  const [savingLimit, setSavingLimit] = useState(false);

  const [expCategory, setExpCategory] = useState("food");
  const [expAmount, setExpAmount] = useState("");
  const [expLabel, setExpLabel] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    tripsApi
      .list()
      .then((d) => setTrips(d.trips || []))
      .catch(() => setTrips([]))
      .finally(() => setLoadingTrips(false));
  }, []);

  const loadBudget = useCallback(async (id) => {
    if (!id) return;
    setLoadingBudget(true);
    setError("");
    try {
      const data = await budgetApi.get(id);
      setBudget(data.budget);
      setExpenses(data.expenses || []);
      setSummary(data.summary);
      setLimitInput(data.budget?.totalLimit != null ? String(data.budget.totalLimit) : "");
    } catch (e) {
      setError(e.message || "Could not load budget");
      setBudget(null);
      setExpenses([]);
      setSummary(null);
    } finally {
      setLoadingBudget(false);
    }
  }, []);

  useEffect(() => {
    const p = location.state?.budgetPrefill;
    if (!p?.tripId) return;
    setTripId(p.tripId);
    if (p.suggestAmount != null && String(p.suggestAmount) !== "") {
      setExpCategory(EXPENSE_CATS.some((x) => x.value === p.suggestCategory) ? p.suggestCategory : "activities");
      setExpAmount(String(p.suggestAmount));
      setExpLabel(typeof p.suggestLabel === "string" ? p.suggestLabel : "");
    }
    navigate("/budget", { replace: true, state: {} });
  }, [location.state, navigate]);

  useEffect(() => {
    if (queryPrefillDone.current) return;
    const qTrip = searchParams.get("tripId");
    const cat = searchParams.get("suggestCategory");
    const amt = searchParams.get("suggestAmount");
    const lab = searchParams.get("suggestLabel");
    if (!qTrip && !(cat && amt)) return;
    queryPrefillDone.current = true;
    if (qTrip) setTripId(qTrip);
    if (cat && amt) {
      setExpCategory(EXPENSE_CATS.some((x) => x.value === cat) ? cat : "activities");
      setExpAmount(amt);
      setExpLabel(lab || "");
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (tripId) loadBudget(tripId);
  }, [tripId, loadBudget]);

  async function saveLimit() {
    if (!tripId) return;
    const n = parseFloat(limitInput, 10);
    setSavingLimit(true);
    setError("");
    try {
      const data = await budgetApi.update(tripId, {
        totalLimit: limitInput === "" ? null : Number.isFinite(n) ? n : 0,
      });
      setBudget(data.budget);
      setExpenses(data.expenses || []);
      setSummary(data.summary);
    } catch (e) {
      setError(e.message || "Could not save limit");
    } finally {
      setSavingLimit(false);
    }
  }

  async function addExpense(ev) {
    ev.preventDefault();
    if (!tripId || !expLabel.trim()) return;
    const amt = parseFloat(expAmount, 10);
    if (!Number.isFinite(amt) || amt < 0) return;
    setAdding(true);
    setError("");
    try {
      const data = await budgetApi.addExpense(tripId, {
        category: expCategory,
        amount: amt,
        label: expLabel.trim(),
      });
      setBudget(data.budget);
      setExpenses(data.expenses || []);
      setSummary(data.summary);
      setExpAmount("");
      setExpLabel("");
    } catch (e) {
      setError(e.message || "Could not add expense");
    } finally {
      setAdding(false);
    }
  }

  async function removeExpense(id) {
    if (!tripId || !window.confirm("Remove this expense?")) return;
    setError("");
    try {
      const data = await budgetApi.deleteExpense(tripId, id);
      setBudget(data.budget);
      setExpenses(data.expenses || []);
      setSummary(data.summary);
    } catch (e) {
      setError(e.message || "Could not delete");
    }
  }

  if (loadingTrips) {
    return <PageLoader message="Loading trips…" />;
  }

  const selectedTrip = trips.find((t) => t.id === tripId);

  return (
    <>
      <PageHeader
        title="Trip budget"
        subtitle="Log expenses by category — charts and daily average use mock rollups from your entries."
      />

      <div className="mb-8 max-w-md">
        <label htmlFor="trip-budget-select" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Trip
        </label>
        <select
          id="trip-budget-select"
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
        >
          <option value="">Select a trip…</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      {!tripId ? (
        <Card>
          <p className="text-slate-600 dark:text-slate-400">Choose a trip to view and edit its budget.</p>
        </Card>
      ) : loadingBudget ? (
        <PageLoader message="Loading budget…" />
      ) : (
        <>
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          {summary?.alerts?.length > 0 && (
            <div className="mb-6 space-y-3">
              {summary.alerts.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                    a.level === "danger"
                      ? "border-red-300 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-100"
                      : a.level === "warning"
                        ? "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
                        : "border-brand-200 bg-brand-50/80 text-brand-950 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-100"
                  }`}
                >
                  {a.level === "danger" ? (
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                  ) : a.level === "warning" ? (
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                  ) : (
                    <Info className="h-5 w-5 shrink-0" />
                  )}
                  <span>{a.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <div className="flex items-center gap-3">
                <PiggyBank className="h-10 w-10 text-brand-500" />
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Total spent</p>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {summary?.currency} {summary?.totalSpent?.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-10 w-10 text-brand-500" />
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Avg / day</p>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {summary?.currency} {summary?.avgPerDay?.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">{summary?.tripDays} day(s)</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Trip limit</p>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {summary?.totalLimit != null ? `${summary.currency} ${summary.totalLimit.toFixed(2)}` : "—"}
                  </p>
                  {summary?.pctOfLimit != null && (
                    <p className="text-xs text-slate-500">{summary.pctOfLimit}% used</p>
                  )}
                </div>
              </div>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Set limit</p>
              <div className="mt-2 flex gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional cap"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" size="sm" disabled={savingLimit} onClick={saveLimit}>
                  Save
                </Button>
              </div>
              <p className="mt-2 text-xs text-slate-500">Alert near {budget?.alertAtPercent ?? 90}% of limit.</p>
            </Card>
          </div>

          {selectedTrip && (
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              Tracking: <span className="font-medium text-slate-900 dark:text-white">{selectedTrip.title}</span>
            </p>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Spend by category</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Pie — hotel, transport, food, activities</p>
              <div className="mt-4 h-72 w-full">
                {summary?.pieData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {summary.pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`${summary.currency} ${v}`, "Amount"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">No expense data yet</div>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Category totals</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Bar chart</p>
              <div className="mt-4 h-72 w-full">
                {summary?.barData?.some((b) => b.amount > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                      <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => [`${summary.currency} ${v}`, "Spent"]} />
                      <Legend />
                      <Bar dataKey="amount" name="Spent" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">Add expenses to see bars</div>
                )}
              </div>
            </Card>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Add expense</h2>
              <form className="mt-4 space-y-4" onSubmit={addExpense}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 dark:border-slate-600 dark:bg-slate-900/70 dark:text-white"
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                  >
                    {EXPENSE_CATS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  label="Amount"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  required
                />
                <Input label="Label" value={expLabel} onChange={(e) => setExpLabel(e.target.value)} required />
                <Button type="submit" disabled={adding}>
                  {adding ? "Adding…" : "Add expense"}
                </Button>
              </form>
            </Card>

            <Card className="lg:col-span-3">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Recent expenses</h2>
              <ul className="mt-4 divide-y divide-slate-200/80 dark:divide-slate-700">
                {expenses.length === 0 ? (
                  <li className="py-8 text-center text-sm text-slate-500">No entries yet.</li>
                ) : (
                  expenses.map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{e.label}</p>
                        <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{e.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-brand-700 dark:text-brand-300">
                          {summary?.currency} {e.amount.toFixed(2)}
                        </span>
                        <Button variant="ghost" size="sm" type="button" className="text-red-600 dark:text-red-400" onClick={() => removeExpense(e.id)}>
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
