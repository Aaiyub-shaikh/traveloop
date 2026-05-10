const CATEGORIES = ["hotel", "transport", "food", "activities"];

/** Trip length in calendar days (inclusive of start and end) */
export function tripDayCount(startDate, endDate) {
  const a = new Date(startDate);
  const b = new Date(endDate);
  const ms = b.getTime() - a.getTime();
  const days = Math.floor(ms / (86400000)) + 1;
  return Math.max(1, days);
}

export function computeBudgetSummary(trip, budget, expenses) {
  const byCategory = {};
  for (const c of CATEGORIES) {
    byCategory[c] = 0;
  }
  let totalSpent = 0;
  for (const e of expenses) {
    const cat = CATEGORIES.includes(e.category) ? e.category : "activities";
    byCategory[cat] += e.amount;
    totalSpent += e.amount;
  }

  const tripDays = tripDayCount(trip.startDate, trip.endDate);
  const avgPerDay = Math.round((totalSpent / tripDays) * 100) / 100;

  const totalLimit = budget.totalLimit;
  const pctOfLimit = totalLimit && totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 1000) / 10 : null;

  const alerts = [];
  const alertThreshold = (budget.alertAtPercent ?? 90) / 100;

  if (totalLimit != null && totalLimit > 0) {
    if (totalSpent > totalLimit) {
      alerts.push({
        level: "danger",
        message: `You are over budget by $${Math.round((totalSpent - totalLimit) * 100) / 100} (${pctOfLimit}% of limit).`,
      });
    } else if (totalSpent >= totalLimit * alertThreshold) {
      alerts.push({
        level: "warning",
        message: `You've used about ${pctOfLimit}% of your trip limit — room left: $${Math.round((totalLimit - totalSpent) * 100) / 100}.`,
      });
    }
  }

  if (totalSpent === 0) {
    alerts.push({ level: "info", message: "Add expenses to see category breakdown and daily averages." });
  }

  const pieData = CATEGORIES.filter((c) => byCategory[c] > 0).map((c) => ({
    name: c.charAt(0).toUpperCase() + c.slice(1),
    key: c,
    value: Math.round(byCategory[c] * 100) / 100,
  }));

  const barData = CATEGORIES.map((c) => ({
    category: c.charAt(0).toUpperCase() + c.slice(1),
    key: c,
    amount: Math.round(byCategory[c] * 100) / 100,
  }));

  return {
    currency: budget.currency || "USD",
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalLimit,
    pctOfLimit,
    tripDays,
    avgPerDay,
    byCategory: Object.fromEntries(
      CATEGORIES.map((c) => [c, Math.round(byCategory[c] * 100) / 100])
    ),
    pieData,
    barData,
    alerts,
  };
}

export { CATEGORIES as EXPENSE_CATEGORIES };
