import { prisma } from "../lib/prisma.js";

/**
 * After authMiddleware — requires User.isAdmin or email listed in ADMIN_EMAILS (comma-separated).
 */
export async function adminMiddleware(req, res, next) {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, isAdmin: true },
    });
    if (!user) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const envList = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const envGrant = envList.length > 0 && envList.includes(user.email.toLowerCase());

    if (user.isAdmin || envGrant) {
      req.adminUser = user;
      return next();
    }

    return res.status(403).json({ message: "Admin access required" });
  } catch (err) {
    console.error("admin middleware:", err);
    return res.status(500).json({ message: "Could not verify admin" });
  }
}
