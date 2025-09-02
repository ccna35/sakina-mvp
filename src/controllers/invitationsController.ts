import { pool } from "../config/db";
import { Request, Response } from "express";
import { invitation } from "../types";
import { RowDataPacket } from "mysql2";

export async function inviteUser(req: Request, res: Response) {
  const targetId = Number(req.body.targetUserId);
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (targetId === req.user.id)
    return res.status(400).json({ error: "Cannot invite self" });

  console.log("Current User ID:", req.user.id);
  console.log("Target ID:", targetId);

  const currentUserId = req.user.id;
  // Check if target user has blocked the current user
  const [blockRows] = await pool.query<(RowDataPacket & Partial<invitation>)[]>(
    `SELECT id FROM invitations
     WHERE ((user_a=:currentUserId
      AND user_b=:targetId) OR (user_a=:targetId AND user_b=:currentUserId))
       AND status='blocked'`,
    { currentUserId, targetId }
  );

  if (blockRows.length > 0) {
    return res.status(403).json({ error: "You cannot invite this user." });
  }

  // Check if the current user has already invited the target user
  const [existingRows] = await pool.query<
    (RowDataPacket & Partial<invitation>)[]
  >(
    `SELECT id, status FROM invitations
     WHERE ((user_a=:currentUserId AND user_b=:targetId) OR (user_a=:targetId AND user_b=:currentUserId)) AND
      initiated_by=:currentUserId AND
     is_open=1`,
    { currentUserId, targetId }
  );

  if (existingRows.length > 0) {
    const existingInvite = existingRows[0];
    if (existingInvite.status === "pending") {
      return res
        .status(400)
        .json({ error: "You have already invited this user." });
    }
  }

  // Check if the target user has already invited the current user
  if (existingRows.length > 0) {
    const existingInvite = existingRows[0];
    if (existingInvite.status === "pending") {
      // Accept the invitation
      await pool.query(
        `UPDATE invitations SET status='active', approved_at=NOW() WHERE id=:inviteId`,
        { inviteId: existingInvite.id }
      );

      return res.json({ message: "Invitation accepted. You are now matched!" });
    }
  }

  // Create a new invitation use named parameters
  await pool.query(
    `INSERT INTO invitations (user_a, user_b, initiated_by) VALUES (:currentUserId, :targetId, :currentUserId)`,
    { currentUserId, targetId }
  );

  res.json({ message: "Invitation sent." });
}

export async function listInvitations(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const currentUserId = req.user.id;

  const [rows] = await pool.query<(RowDataPacket & Partial<invitation>)[]>(
    `SELECT * FROM invitations
     WHERE (user_a=:currentUserId OR user_b=:currentUserId)
     ORDER BY created_at DESC`,
    { currentUserId }
  );

  res.json(rows);
}
