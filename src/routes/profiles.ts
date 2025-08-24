import { Router } from "express";
import {
  getProfile,
  listProfiles,
  updateMyProfile,
} from "../controllers/profileController";
import { requireAuth } from "../middleware/auth";
const r = Router();
r.get("/:id", getProfile);
// List all profiles
r.get("/", listProfiles);
r.put("/me", requireAuth, updateMyProfile);
export default r;
