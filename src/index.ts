import "dotenv/config";
import express from "express";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./auth/auth.routes";
import { classesRoutes } from "./classes/classes.routes";
import { participantsRoutes } from "./participants/participants.routes";
import { teamRoutes } from "./team/team.routes";
import { sessionsRoutes } from "./sessions/sessions.routes";
import { statsRoutes } from "./stats/stats.routes";
import { assertRuntimeEnv, getPort } from "./config/env";

assertRuntimeEnv();

const app = express();

app.set("trust proxy", 1);
app.use(corsMiddleware);
app.options("*", corsMiddleware);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "API funcionando!" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/participants", participantsRoutes);
app.use("/team", teamRoutes);
app.use("/classes", classesRoutes);
app.use("/sessions", sessionsRoutes);
app.use("/stats", statsRoutes);

app.use(errorHandler);
const PORT = getPort();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Server] Running on PORT ${PORT}`);
});