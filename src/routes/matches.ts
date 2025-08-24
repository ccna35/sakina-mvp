import { Router } from "express";
import { likeUser, listMatches } from "../controllers/matchController";
import { requireAuth } from "../middleware/auth";
const r = Router();
r.post("/like/:targetUserId", requireAuth, likeUser);
r.get("/", requireAuth, listMatches);
export default r;
