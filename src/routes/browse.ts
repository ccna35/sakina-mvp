import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { nearby } from "../controllers/browseController";
const r = Router();

r.get("/nearby", requireAuth, nearby);
export default r;
