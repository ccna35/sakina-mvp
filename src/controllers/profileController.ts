import { pool } from "../config/db";
import { Request, Response } from "express";
import { z } from "zod";
import { encrypt } from "../utils/crypto";

export async function getProfile(req: Request, res: Response) {
  const id = Number(req.params.id);
  const [rows] = (await pool.query(
    "SELECT user_id, display_name, dob, country, city, madhhab, prayer_level, marital_status, bio, photo_url FROM profiles WHERE user_id=?",
    [id]
  )) as any;
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
}

// List all profiles
export async function listProfiles(req: Request, res: Response) {
  const [rows] = (await pool.query(
    "SELECT user_id, display_name, dob, country, city, madhhab, prayer_level, marital_status, bio, photo_url FROM profiles"
  )) as any;
  res.json(rows);
}

const UpdateSchema = z.object({
  display_name: z.string().min(2),
  dob: z.string(),
  country: z.string().optional(),
  city: z.string().optional(),
  madhhab: z.string().optional(),
  prayer_level: z.number().int().min(0).max(5).optional(),
  marital_status: z.enum(["single", "divorced", "widowed"]),
  wali_name: z.string().optional(),
  wali_relation: z.string().optional(),
  wali_contact: z.string().optional(), // plaintext from user
  bio: z.string().max(500).optional(),
  photo_url: z.string().url().optional(),
});

export async function updateMyProfile(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const parsed = UpdateSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  const p = parsed.data;
  const enc = p.wali_contact ? encrypt(p.wali_contact) : null;
  await pool.query(
    `INSERT INTO profiles (user_id, display_name, dob, country, city, madhhab, prayer_level, marital_status,
       wali_name, wali_relation, wali_contact_encrypted, bio, photo_url)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       display_name=VALUES(display_name), dob=VALUES(dob), country=VALUES(country), city=VALUES(city),
       madhhab=VALUES(madhhab), prayer_level=VALUES(prayer_level), marital_status=VALUES(marital_status),
       wali_name=VALUES(wali_name), wali_relation=VALUES(wali_relation),
       wali_contact_encrypted=VALUES(wali_contact_encrypted), bio=VALUES(bio), photo_url=VALUES(photo_url)`,
    [
      req.user.id,
      p.display_name,
      p.dob,
      p.country || null,
      p.city || null,
      p.madhhab || null,
      p.prayer_level ?? null,
      p.marital_status,
      p.wali_name || null,
      p.wali_relation || null,
      enc,
      p.bio || null,
      p.photo_url || null,
    ]
  );
  res.json({ ok: true });
}
