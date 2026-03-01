"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
const cors_1 = __importDefault(require("cors"));
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "";
const CORS_ORIGIN_REGEX = process.env.CORS_ORIGIN_REGEX;
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
        if (CORS_ORIGIN && origin === CORS_ORIGIN)
            return cb(null, true);
        if (originRegex && originRegex.test(origin))
            return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 200,
});
//# sourceMappingURL=cors.js.map