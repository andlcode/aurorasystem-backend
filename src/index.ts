import "dotenv/config";
import express from "express";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./auth/auth.routes";
import { classesRoutes } from "./classes/classes.routes";
import { peopleRoutes } from "./people/people.routes";
import { sessionsRoutes } from "./sessions/sessions.routes";
import { statsRoutes } from "./stats/stats.routes";

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
app.use("/people", peopleRoutes);
app.use("/classes", classesRoutes);
app.use("/sessions", sessionsRoutes);
app.use("/stats", statsRoutes);

app.use(errorHandler);
const PORT = parseInt(process.env.PORT ?? "", 10);

if (!PORT) {
  console.error("❌ PORT env var not set. Railway Web Services require PORT.");
  process.exit(1);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Server] Running on PORT ${PORT}`);
});