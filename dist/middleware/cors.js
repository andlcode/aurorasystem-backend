"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
const cors_1 = __importDefault(require("cors"));
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "";
const CORS_ORIGIN_REGEX = process.env.CORS_ORIGIN_REGEX;
const STATIC_ALLOWED_ORIGINS = new Set(["http://localhost:5173"]);
function normalizeOrigin(origin) {
    return origin.replace(/\/$/, "");
}
let originRegex = null;
if (CORS_ORIGIN_REGEX) {
    try {
        originRegex = new RegExp(CORS_ORIGIN_REGEX);
    }
    catch (err) {
        console.warn("[CORS] CORS_ORIGIN_REGEX inválido, ignorando:", CORS_ORIGIN_REGEX);
    }
}
exports.corsMiddleware = (0, cors_1.default)({
    origin: (origin, cb) => {
        if (!origin)
            return cb(null, true);
        const normalizedOrigin = normalizeOrigin(origin);
        const normalizedConfiguredOrigin = CORS_ORIGIN ? normalizeOrigin(CORS_ORIGIN) : "";
        if (STATIC_ALLOWED_ORIGINS.has(normalizedOrigin))
            return cb(null, true);
        if (normalizedConfiguredOrigin && normalizedOrigin === normalizedConfiguredOrigin)
            return cb(null, true);
        if (originRegex && originRegex.test(normalizedOrigin))
            return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 200,
});
//# sourceMappingURL=cors.js.map