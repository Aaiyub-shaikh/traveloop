/**
 * Central server configuration
 */
const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv === "production";

function parseCorsOrigins() {
  const raw = process.env.CORS_ORIGIN || "http://localhost:5173";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const serverConfig = {
  nodeEnv,
  isProd,
  port: Number(process.env.PORT) || 5000,
  corsOrigins: parseCorsOrigins(),
  /** Set TRUST_PROXY=1 behind Render/Railway/nginx */
  trustProxy: process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true" || isProd,
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
};
