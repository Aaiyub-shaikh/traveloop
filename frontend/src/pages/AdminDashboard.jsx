import { useCallback, useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  BarChart3,
  Coins,
  MapPin,
  Shield,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";
import { adminApi } from "../lib/api.js";
import { getErrorMessage } from "../lib/httpClient.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";

const chartAxis = { stroke: "currentColor", fontSize: 11 };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.analytics();
      setData(res);
    } catch (e) {
      setError(getErrorMessage(e, "Could not load analytics"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fmtMoney = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n) || 0);

  return (
    <>
      <PageHeader
        title="Admin analytics"
        subtitle="Platform metrics from live database aggregates"
        actions={
          <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={load}>
            Refresh
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone="success">Admin</Badge>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Grant access with <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">User.isAdmin</code> or{" "}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">ADMIN_EMAILS</code> in backend env.
        </span>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50/80 dark:border-red-900/40 dark:bg-red-950/30">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          <Button type="button" className="mt-3" variant="secondary" size="sm" onClick={load}>
            Retry
          </Button>
        </Card>
      )}

      {loading && !data ? (
        <div className="flex justify-center py-16 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5">
              <Users className="h-8 w-8 text-brand-500" />
              <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">{data.users.total}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Registered users</p>
            </Card>
            <Card className="p-5">
              <BarChart3 className="h-8 w-8 text-brand-500" />
              <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">{data.trips.total}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Trips created</p>
            </Card>
            <Card className="p-5">
              <Activity className="h-8 w-8 text-brand-500" />
              <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">{data.activities.total}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Itinerary activities</p>
              <p className="mt-1 text-xs text-slate-500">Avg {data.activities.avgPerStop} per stop</p>
            </Card>
            <Card className="p-5">
              <Coins className="h-8 w-8 text-brand-500" />
              <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">{fmtMoney(data.expenses.totalAmount)}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{data.expenses.count} expenses logged</p>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-500" />
                <h2 className="font-display font-semibold text-slate-900 dark:text-white">Trips created by month</h2>
              </div>
              <div className="h-72 w-full text-slate-600 dark:text-slate-400">
                {data.tripsByMonth.length === 0 ? (
                  <p className="py-12 text-center text-sm text-slate-500">No trip data in the last 12 months.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.tripsByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                      <XAxis dataKey="month" tick={chartAxis} />
                      <YAxis allowDecimals={false} tick={chartAxis} width={36} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid rgb(226 232 240)",
                          background: "rgba(255,255,255,0.95)",
                        }}
                      />
                      <Line type="monotone" dataKey="count" name="Trips" stroke="#0891b2" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-500" />
                <h2 className="font-display font-semibold text-slate-900 dark:text-white">New users by month</h2>
              </div>
              <div className="h-72 w-full text-slate-600 dark:text-slate-400">
                {data.usersByMonth.length === 0 ? (
                  <p className="py-12 text-center text-sm text-slate-500">No signups in the last 12 months.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.usersByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                      <XAxis dataKey="month" tick={chartAxis} />
                      <YAxis allowDecimals={false} tick={chartAxis} width={36} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid rgb(226 232 240)",
                          background: "rgba(255,255,255,0.95)",
                        }}
                      />
                      <Bar dataKey="count" name="Users" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-500" />
                <h2 className="font-display font-semibold text-slate-900 dark:text-white">Popular cities (by stops)</h2>
              </div>
              {data.popularCities.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No stops yet.</p>
              ) : (
                <>
                  <div className="mb-4 h-64 w-full text-slate-600 dark:text-slate-400">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={data.popularCities.map((c) => ({
                          label: `${c.emoji} ${c.name}`,
                          stops: c.stopCount,
                        }))}
                        margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tick={chartAxis} />
                        <YAxis type="category" dataKey="label" width={120} tick={chartAxis} />
                        <Tooltip />
                        <Bar dataKey="stops" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700">
                    <table className="w-full min-w-[320px] text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/50">
                        <tr>
                          <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">City</th>
                          <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">Country</th>
                          <th className="px-3 py-2 text-right font-medium text-slate-700 dark:text-slate-300">Stops</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.popularCities.map((c) => (
                          <tr key={c.cityId} className="border-b border-slate-100 dark:border-slate-800">
                            <td className="px-3 py-2 text-slate-900 dark:text-white">
                              <span className="mr-1">{c.emoji}</span>
                              {c.name}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{c.country}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-800 dark:text-slate-200">{c.stopCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand-500" />
                <h2 className="font-display font-semibold text-slate-900 dark:text-white">Activity titles (top repeats)</h2>
              </div>
              {data.activities.topTitles.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No activities yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <table className="w-full min-w-[280px] text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/50">
                      <tr>
                        <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">Title</th>
                        <th className="px-3 py-2 text-right font-medium text-slate-700 dark:text-slate-300">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.activities.topTitles.map((row) => (
                        <tr key={row.title} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="max-w-[220px] truncate px-3 py-2 text-slate-900 dark:text-white" title={row.title}>
                            {row.title}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-800 dark:text-slate-200">{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                <p className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                  <Shield className="h-4 w-4" />
                  Summary
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>{data.itineraries.total} itineraries</li>
                  <li>{data.stops.total} stops across all trips</li>
                </ul>
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </>
  );
}
