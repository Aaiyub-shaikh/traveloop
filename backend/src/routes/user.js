import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { Router } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma.js";
import { serializePublicUser, serializeSavedDestination } from "../lib/serializeUser.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const SALT_ROUNDS = 10;

router.use(authMiddleware);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../../uploads/avatars");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const okType = typeof file.mimetype === "string" && file.mimetype.startsWith("image/");
    const name = (file.originalname || "").toLowerCase();
    const okName = /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(name);
    if (okType || okName) {
      return cb(null, true);
    }
    return cb(new Error("Please upload an image file"));
  },
});

const ALLOWED_LANG = new Set(["en", "es", "fr", "de", "pt", "it"]);
const ALLOWED_THEME = new Set(["light", "dark", "system"]);
const ALLOWED_CURRENCY = new Set(["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "INR", "BRL", "CHF"]);

/** GET /api/user/profile */
router.get("/profile", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ profile: serializePublicUser(user) });
  } catch (err) {
    console.error("user profile get:", err);
    res.status(500).json({ message: "Could not load profile" });
  }
});

/** PUT /api/user/profile — name, email, bio, profilePhoto (URL or empty) */
router.put("/profile", async (req, res) => {
  try {
    const { name, email, bio, profilePhoto } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const data = {};
    const errors = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        errors.name = "Name is required";
      } else if (name.trim().length > 120) {
        errors.name = "Name is too long";
      } else {
        data.name = name.trim();
      }
    }

    if (email !== undefined) {
      const em = typeof email === "string" ? email.trim().toLowerCase() : "";
      if (!em) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
        errors.email = "Invalid email";
      } else if (em.length > 254) {
        errors.email = "Email is too long";
      } else {
        const taken = await prisma.user.findFirst({
          where: { email: em, NOT: { id: user.id } },
        });
        if (taken) {
          errors.email = "Email is already in use";
        } else {
          data.email = em;
        }
      }
    }

    if (bio !== undefined) {
      if (typeof bio !== "string") {
        errors.bio = "Bio must be text";
      } else if (bio.length > 5000) {
        errors.bio = "Bio is too long";
      } else {
        data.bio = bio;
      }
    }

    if (profilePhoto !== undefined) {
      if (profilePhoto === null || profilePhoto === "") {
        data.profilePhoto = "";
      } else if (typeof profilePhoto !== "string") {
        errors.profilePhoto = "Invalid photo URL";
      } else if (profilePhoto.length > 2000) {
        errors.profilePhoto = "Photo URL is too long";
      } else {
        data.profilePhoto = profilePhoto.trim();
      }
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    if (Object.keys(data).length === 0) {
      return res.json({ profile: serializePublicUser(user) });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });
    res.json({ profile: serializePublicUser(updated) });
  } catch (err) {
    console.error("user profile put:", err);
    res.status(500).json({ message: "Could not update profile" });
  }
});

/** POST /api/user/profile/photo — multipart field "photo" */
router.post("/profile/photo", (req, res) => {
  upload.single("photo")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    try {
      await mkdir(uploadDir, { recursive: true });
      const ext = path.extname(req.file.originalname || "").toLowerCase();
      const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
      const filename = `${req.user.sub}-${Date.now()}-${randomBytes(4).toString("hex")}${safeExt}`;
      const diskPath = path.join(uploadDir, filename);
      await writeFile(diskPath, req.file.buffer);

      const publicPath = `/uploads/avatars/${filename}`;
      const user = await prisma.user.update({
        where: { id: req.user.sub },
        data: { profilePhoto: publicPath },
      });
      res.json({ profilePhoto: publicPath, profile: serializePublicUser(user) });
    } catch (e) {
      console.error("photo upload:", e);
      res.status(500).json({ message: "Could not save photo" });
    }
  });
});

/** PUT /api/user/preferences */
router.put("/preferences", async (req, res) => {
  try {
    const { language, theme, currency, notificationsEnabled, notifyTripReminders, notifyWeeklyDigest } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const data = {};
    const errors = {};

    if (language !== undefined) {
      if (typeof language !== "string" || !ALLOWED_LANG.has(language)) {
        errors.language = "Unsupported language";
      } else {
        data.language = language;
      }
    }

    if (theme !== undefined) {
      if (typeof theme !== "string" || !ALLOWED_THEME.has(theme)) {
        errors.theme = "Theme must be light, dark, or system";
      } else {
        data.theme = theme;
      }
    }

    if (currency !== undefined) {
      if (typeof currency !== "string" || !ALLOWED_CURRENCY.has(currency)) {
        errors.currency = "Unsupported currency";
      } else {
        data.currency = currency;
      }
    }

    if (notificationsEnabled !== undefined) {
      if (typeof notificationsEnabled !== "boolean") {
        errors.notificationsEnabled = "Must be boolean";
      } else {
        data.notificationsEnabled = notificationsEnabled;
      }
    }

    if (notifyTripReminders !== undefined) {
      if (typeof notifyTripReminders !== "boolean") {
        errors.notifyTripReminders = "Must be boolean";
      } else {
        data.notifyTripReminders = notifyTripReminders;
      }
    }

    if (notifyWeeklyDigest !== undefined) {
      if (typeof notifyWeeklyDigest !== "boolean") {
        errors.notifyWeeklyDigest = "Must be boolean";
      } else {
        data.notifyWeeklyDigest = notifyWeeklyDigest;
      }
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    if (Object.keys(data).length === 0) {
      return res.json({ profile: serializePublicUser(user) });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });
    res.json({ profile: serializePublicUser(updated) });
  } catch (err) {
    console.error("user preferences:", err);
    res.status(500).json({ message: "Could not save preferences" });
  }
});

/** PUT /api/user/password */
router.put("/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || typeof currentPassword !== "string") {
      return res.status(400).json({ message: "Current password is required" });
    }
    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({ message: "New password is required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("user password:", err);
    res.status(500).json({ message: "Could not change password" });
  }
});

/** DELETE /api/user/account */
router.delete("/account", async (req, res) => {
  try {
    const { confirmEmail } = req.body || {};
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (typeof confirmEmail !== "string" || confirmEmail.trim().toLowerCase() !== user.email) {
      return res.status(400).json({ message: "Type your email to confirm account deletion" });
    }

    await prisma.user.delete({ where: { id: user.id } });
    res.status(204).send();
  } catch (err) {
    console.error("user delete:", err);
    res.status(500).json({ message: "Could not delete account" });
  }
});

/** GET /api/user/saved-destinations */
router.get("/saved-destinations", async (req, res) => {
  try {
    const rows = await prisma.savedDestination.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: "desc" },
    });
    res.json({ destinations: rows.map(serializeSavedDestination) });
  } catch (err) {
    console.error("saved destinations:", err);
    res.status(500).json({ message: "Could not load saved destinations" });
  }
});

/** POST /api/user/saved-destinations */
router.post("/saved-destinations", async (req, res) => {
  try {
    const { cityName, country, imageUrl } = req.body;
    if (!cityName || typeof cityName !== "string" || !cityName.trim()) {
      return res.status(400).json({ message: "cityName is required" });
    }
    if (!country || typeof country !== "string" || !country.trim()) {
      return res.status(400).json({ message: "country is required" });
    }
    const img = typeof imageUrl === "string" ? imageUrl.trim().slice(0, 2000) : "";

    const row = await prisma.savedDestination.create({
      data: {
        userId: req.user.sub,
        cityName: cityName.trim().slice(0, 200),
        country: country.trim().slice(0, 200),
        imageUrl: img,
      },
    });
    res.status(201).json({ destination: serializeSavedDestination(row) });
  } catch (err) {
    console.error("save destination:", err);
    res.status(500).json({ message: "Could not save destination" });
  }
});

/** DELETE /api/user/saved-destinations/:id */
router.delete("/saved-destinations/:id", async (req, res) => {
  try {
    const row = await prisma.savedDestination.findFirst({
      where: { id: req.params.id, userId: req.user.sub },
    });
    if (!row) {
      return res.status(404).json({ message: "Not found" });
    }
    await prisma.savedDestination.delete({ where: { id: row.id } });
    res.status(204).send();
  } catch (err) {
    console.error("delete destination:", err);
    res.status(500).json({ message: "Could not remove destination" });
  }
});

export default router;
