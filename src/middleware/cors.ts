import cors from "cors";

const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "";
const CORS_ORIGIN_REGEX = process.env.CORS_ORIGIN_REGEX;

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
    if (CORS_ORIGIN && origin === CORS_ORIGIN) return cb(null, true);
    if (originRegex && originRegex.test(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
});
