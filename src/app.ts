import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profiles";
import matchRoutes from "./routes/matches";
import waliRoutes from "./routes/wali";

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));

app.use("/auth", authRoutes);
app.use("/profiles", profileRoutes);
app.use("/matches", matchRoutes);
app.use("/wali", waliRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

export default app;
