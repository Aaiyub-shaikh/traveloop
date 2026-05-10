import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { serializePublicUser } from "../lib/serializeUser.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const SALT_ROUNDS = 10;

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

/** POST /api/auth/register — create user, return JWT + user */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashed,
      },
    });

    const token = signToken({ sub: user.id, email: user.email });
    const full = await prisma.user.findUnique({ where: { id: user.id } });
    res.status(201).json({
      token,
      user: serializePublicUser(full),
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

/** POST /api/auth/login */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken({ sub: user.id, email: user.email });
    const full = await prisma.user.findUnique({ where: { id: user.id } });
    res.json({
      token,
      user: serializePublicUser(full),
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

/** GET /api/auth/me — current user (protected) */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user: serializePublicUser(user) });
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ message: "Could not load profile" });
  }
});

export default router;
