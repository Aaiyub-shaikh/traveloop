import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { assertTripOwned } from "../lib/itineraryGuards.js";
import { authMiddleware } from "../middleware/auth.js";
import { computeBudgetSummary, EXPENSE_CATEGORIES } from "../lib/budgetCompute.js";

const router = Router();
router.use(authMiddleware);

function serializeExpense(e) {
  return {
    id: e.id,
    budgetId: e.budgetId,
    category: e.category,
    amount: e.amount,
    label: e.label,
    notes: e.notes,
    createdAt: e.createdAt.toISOString(),
  };
}

function serializeBudget(b) {
  return {
    id: b.id,
    tripId: b.tripId,
    currency: b.currency,
    totalLimit: b.totalLimit,
    alertAtPercent: b.alertAtPercent,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

/** GET /api/trips/:tripId/budget — budget + expenses + computed summary */
router.get("/:tripId/budget", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    let budget = await prisma.budget.findUnique({
      where: { tripId: trip.id },
      include: { expenses: { orderBy: { createdAt: "desc" } } },
    });

    if (!budget) {
      budget = await prisma.budget.create({
        data: { tripId: trip.id },
        include: { expenses: true },
      });
    }

    const summary = computeBudgetSummary(trip, budget, budget.expenses);

    res.json({
      budget: serializeBudget(budget),
      expenses: budget.expenses.map(serializeExpense),
      summary,
    });
  } catch (err) {
    console.error("get budget:", err);
    res.status(500).json({ message: "Could not load budget" });
  }
});

/** PUT /api/trips/:tripId/budget — limits & alerts */
router.put("/:tripId/budget", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    let budget = await prisma.budget.findUnique({ where: { tripId: trip.id } });
    if (!budget) {
      budget = await prisma.budget.create({ data: { tripId: trip.id } });
    }

    const { currency, totalLimit, alertAtPercent } = req.body;
    const data = {};
    if (currency !== undefined && typeof currency === "string" && currency.trim()) {
      data.currency = currency.trim().slice(0, 8).toUpperCase();
    }
    if (totalLimit !== undefined) {
      if (totalLimit === null) {
        data.totalLimit = null;
      } else if (typeof totalLimit === "number" && totalLimit >= 0) {
        data.totalLimit = totalLimit;
      } else {
        return res.status(400).json({ message: "totalLimit must be a non-negative number or null" });
      }
    }
    if (alertAtPercent !== undefined) {
      if (typeof alertAtPercent === "number" && alertAtPercent > 0 && alertAtPercent <= 100) {
        data.alertAtPercent = alertAtPercent;
      } else {
        return res.status(400).json({ message: "alertAtPercent must be between 1 and 100" });
      }
    }

    const updated = await prisma.budget.update({
      where: { id: budget.id },
      data,
      include: { expenses: { orderBy: { createdAt: "desc" } } },
    });

    const summary = computeBudgetSummary(trip, updated, updated.expenses);

    res.json({
      budget: serializeBudget(updated),
      expenses: updated.expenses.map(serializeExpense),
      summary,
    });
  } catch (err) {
    console.error("update budget:", err);
    res.status(500).json({ message: "Could not update budget" });
  }
});

/** POST /api/trips/:tripId/budget/expenses */
router.post("/:tripId/budget/expenses", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    let budget = await prisma.budget.findUnique({ where: { tripId: trip.id } });
    if (!budget) {
      budget = await prisma.budget.create({ data: { tripId: trip.id } });
    }

    const { category, amount, label, notes } = req.body;
    if (!category || !EXPENSE_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `category must be one of: ${EXPENSE_CATEGORIES.join(", ")}` });
    }
    if (typeof amount !== "number" || amount < 0 || !Number.isFinite(amount)) {
      return res.status(400).json({ message: "amount must be a non-negative number" });
    }
    if (!label || typeof label !== "string" || !label.trim()) {
      return res.status(400).json({ message: "label is required" });
    }

    const expense = await prisma.expense.create({
      data: {
        budgetId: budget.id,
        category,
        amount,
        label: label.trim(),
        notes: typeof notes === "string" ? notes : "",
      },
    });

    const full = await prisma.budget.findUnique({
      where: { id: budget.id },
      include: { expenses: { orderBy: { createdAt: "desc" } } },
    });
    const summary = computeBudgetSummary(trip, full, full.expenses);

    res.status(201).json({
      expense: serializeExpense(expense),
      budget: serializeBudget(full),
      expenses: full.expenses.map(serializeExpense),
      summary,
    });
  } catch (err) {
    console.error("add expense:", err);
    res.status(500).json({ message: "Could not add expense" });
  }
});

/** DELETE /api/trips/:tripId/budget/expenses/:expenseId */
router.delete("/:tripId/budget/expenses/:expenseId", async (req, res) => {
  try {
    const trip = await assertTripOwned(req.user.sub, req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const budget = await prisma.budget.findUnique({ where: { tripId: trip.id } });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const expense = await prisma.expense.findFirst({
      where: { id: req.params.expenseId, budgetId: budget.id },
    });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await prisma.expense.delete({ where: { id: expense.id } });

    const full = await prisma.budget.findUnique({
      where: { id: budget.id },
      include: { expenses: { orderBy: { createdAt: "desc" } } },
    });
    const summary = computeBudgetSummary(trip, full, full.expenses);

    res.json({
      budget: serializeBudget(full),
      expenses: full.expenses.map(serializeExpense),
      summary,
    });
  } catch (err) {
    console.error("delete expense:", err);
    res.status(500).json({ message: "Could not delete expense" });
  }
});

export default router;
