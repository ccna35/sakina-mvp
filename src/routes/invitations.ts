import { Router } from "express";
import {
  inviteUser,
  listInvitations,
} from "../controllers/invitationsController";
import { requireAuth } from "../middleware/auth";
const r = Router();
r.post("/", requireAuth, inviteUser);
r.get("/", requireAuth, listInvitations);
export default r;
