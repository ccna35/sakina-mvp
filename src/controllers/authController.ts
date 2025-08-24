import { pool } from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  gender: z.enum(["male", "female"]),
});

export async function register(req: Request, res: Response) {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, gender } = parsed.data;
  const [r1] = (await pool.query("SELECT id FROM users WHERE email=?", [
    email,
  ])) as any;
  if (r1.length) return res.status(409).json({ error: "Email already in use" });
  const hash = await bcrypt.hash(password, 10);
  const [r2] = (await pool.query(
    "INSERT INTO users (email, password_hash, gender) VALUES (?,?,?)",
    [email, hash, gender]
  )) as any;
  const id = r2.insertId;
  const token = jwt.sign(
    { id, role: "user", gender },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
  res.json({ token });
}

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(req: Request, res: Response) {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const [rows] = (await pool.query(
    "SELECT id, password_hash, role, gender FROM users WHERE email=?",
    [email]
  )) as any;
  if (!rows.length)
    return res.status(401).json({ error: "Invalid credentials" });
  const u = rows[0];
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign(
    { id: u.id, role: u.role, gender: u.gender },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
  res.json({ token });
}
