"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = require("./middleware/cors");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = require("./auth/auth.routes");
const classes_routes_1 = require("./classes/classes.routes");
const participants_routes_1 = require("./participants/participants.routes");
const team_routes_1 = require("./team/team.routes");
const sessions_routes_1 = require("./sessions/sessions.routes");
const stats_routes_1 = require("./stats/stats.routes");
const env_1 = require("./config/env");
(0, env_1.assertRuntimeEnv)();
const app = (0, express_1.default)();
app.set("trust proxy", 1);
app.use(cors_1.corsMiddleware);
app.options("*", cors_1.corsMiddleware);
app.use(express_1.default.json());
app.get("/", (_req, res) => {
    res.json({ message: "API funcionando!" });
});
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/auth", auth_routes_1.authRoutes);
app.use("/participants", participants_routes_1.participantsRoutes);
app.use("/team", team_routes_1.teamRoutes);
app.use("/classes", classes_routes_1.classesRoutes);
app.use("/sessions", sessions_routes_1.sessionsRoutes);
app.use("/stats", stats_routes_1.statsRoutes);
app.use(errorHandler_1.errorHandler);
const PORT = (0, env_1.getPort)();
app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on PORT ${PORT}`);
});
//# sourceMappingURL=index.js.map