import { pool } from "../config/db";
import { Request, Response } from "express";
import { decrypt } from "../utils/crypto";

export async function requestWali(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  // Find match and target female
  const matchId = Number(req.params.matchId);
  const [mrows] = (await pool.query(
    "SELECT id, user_a, user_b FROM matches WHERE id=?",
    [matchId]
  )) as any;
  if (!mrows.length) return res.status(404).json({ error: "Match not found" });
  const m = mrows[0];

  const peerId =
    m.user_a === req.user.id
      ? m.user_b
      : m.user_b === req.user.id
      ? m.user_a
      : null;

  if (!peerId) return res.status(403).json({ error: "Not part of this match" });
  // Only male can request
  const [you] = (await pool.query("SELECT gender FROM users WHERE id=?", [
    req.user.id,
  ])) as any;
  if (!you.length || you[0].gender !== "male")
    return res
      .status(403)
      .json({ error: "Only male can request wali contact" });
  // Ensure peer is female
  const [peer] = (await pool.query("SELECT gender FROM users WHERE id=?", [
    peerId,
  ])) as any;
  if (!peer.length || peer[0].gender !== "female")
    return res.status(400).json({ error: "Target must be female" });
  await pool.query(
    "INSERT INTO wali_requests (match_id, requester_male_id, target_female_id) VALUES (?,?,?)",
    [matchId, req.user.id, peerId]
  );
  res.json({ status: "pending" });
}

export async function decideWali(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const reqId = Number(req.params.requestId);
  const { decision } = req.body as { decision: "approve" | "reject" };
  const [rows] = (await pool.query("SELECT * FROM wali_requests WHERE id=?", [
    reqId,
  ])) as any;
  if (!rows.length) return res.status(404).json({ error: "Request not found" });
  const wr = rows[0];
  // For MVP: moderator decides
  const [me] = (await pool.query("SELECT role FROM users WHERE id=?", [
    req.user.id,
  ])) as any;
  if (!me.length || (me[0].role !== "moderator" && me[0].role !== "admin"))
    return res.status(403).json({ error: "Moderator only" });
  const status = decision === "approve" ? "approved" : "rejected";
  await pool.query(
    "UPDATE wali_requests SET status=?, moderator_id=?, decided_at=NOW() WHERE id=?",
    [status, req.user.id, reqId]
  );
  if (status === "approved") {
    const [p] = (await pool.query(
      "SELECT wali_contact_encrypted FROM profiles WHERE user_id=?",
      [wr.target_female_id]
    )) as any;
    const contact =
      p.length && p[0].wali_contact_encrypted
        ? decrypt(p[0].wali_contact_encrypted)
        : null;
    return res.json({ status, wali_contact: contact });
  }
  res.json({ status });
}
