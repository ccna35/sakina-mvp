import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profiles";
import invitationsRoutes from "./routes/invitations";
import waliRoutes from "./routes/wali";
import browseRoutes from "./routes/browse";

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profiles", profileRoutes);
app.use("/api/v1/invitations", invitationsRoutes);
app.use("/api/v1/wali", waliRoutes);
app.use("/api/v1/browse", browseRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

export default app;
