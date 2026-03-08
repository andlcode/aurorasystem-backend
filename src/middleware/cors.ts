import cors from "cors";

const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "";
const CORS_ORIGIN_REGEX = process.env.CORS_ORIGIN_REGEX;
const STATIC_ALLOWED_ORIGINS = new Set(["http://localhost:5173"]);

function normalizeOrigin(origin: string) {
  return origin.replace(/\/$/, "");
}

let originRegex: RegExp | null = null;
if (CORS_ORIGIN_REGEX) {
  try {
    originRegex = new RegExp(CORS_ORIGIN_REGEX);
  } catch (err) {
    console.warn("[CORS] CORS_ORIGIN_REGEX inválido, ignorando:", CORS_ORIGIN_REGEX);
  }
}

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const normalizedOrigin = normalizeOrigin(origin);
    const normalizedConfiguredOrigin = CORS_ORIGIN ? normalizeOrigin(CORS_ORIGIN) : "";

    if (STATIC_ALLOWED_ORIGINS.has(normalizedOrigin)) return cb(null, true);
    if (normalizedConfiguredOrigin && normalizedOrigin === normalizedConfiguredOrigin) return cb(null, true);
    if (originRegex && originRegex.test(normalizedOrigin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
});



