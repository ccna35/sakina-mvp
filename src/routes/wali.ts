import { Router } from "express";
import { requestWali, decideWali } from "../controllers/waliController";
import { requireAuth } from "../middleware/auth";
const r = Router();
r.post("/:matchId/request", requireAuth, requestWali);
r.post("/decide/:requestId", requireAuth, decideWali);
export default r;
