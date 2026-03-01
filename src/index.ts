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
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);
app.use(corsMiddleware);
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

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});
