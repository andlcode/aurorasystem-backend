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
const people_routes_1 = require("./people/people.routes");
const sessions_routes_1 = require("./sessions/sessions.routes");
const stats_routes_1 = require("./stats/stats.routes");
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3000;
app.set("trust proxy", 1);
app.use(cors_1.corsMiddleware);
app.use(express_1.default.json());
app.get("/", (_req, res) => {
    res.json({ message: "API funcionando!" });
});
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/auth", auth_routes_1.authRoutes);
app.use("/people", people_routes_1.peopleRoutes);
app.use("/classes", classes_routes_1.classesRoutes);
app.use("/sessions", sessions_routes_1.sessionsRoutes);
app.use("/stats", stats_routes_1.statsRoutes);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map