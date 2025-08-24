import { pool } from "../config/db";
import { Request, Response } from "express";

export async function likeUser(req: Request, res: Response) {
  const targetId = Number(req.params.targetUserId);
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (targetId === req.user.id)
    return res.status(400).json({ error: "Cannot like self" });
  await pool.query(
    "INSERT IGNORE INTO likes (liker_id, liked_id) VALUES (?,?)",
    [req.user.id, targetId]
  );
  // Check for mutual like
  const [rows] = (await pool.query(
    "SELECT 1 FROM likes WHERE liker_id=? AND liked_id=?",
    [targetId, req.user.id]
  )) as any;
  if (rows.length) {
    // create match if not exists
    await pool.query(
      `INSERT IGNORE INTO matches (user_a, user_b) VALUES (?,?)`,
      [Math.min(req.user.id, targetId), Math.max(req.user.id, targetId)]
    );
    return res.json({ matched: true });
  }
  res.json({ liked: true });
}

export async function listMatches(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const [rows] = (await pool.query(
    `SELECT id, user_a, user_b, created_at, is_active FROM matches
     WHERE user_a=? OR user_b=?`,
    [req.user.id, req.user.id]
  )) as any;
  res.json(rows);
}
