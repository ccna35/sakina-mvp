// src/models/users.model.ts
import { query } from "../db";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role_id: number; // FK to roles.id
  gender: "male" | "female";
  is_verified: 0 | 1;
  created_at: string;
  updated_at: string;
}

export async function getUserById(id: number) {
  const rows = await query<User>(
    `SELECT id, email, password_hash, role_id, gender, is_verified, created_at, updated_at
     FROM users WHERE id = :id`,
    { id }
  );
  return rows[0] || null;
}

export async function getUserByEmail(email: string) {
  const rows = await query<User>(
    `SELECT id, email, password_hash, role_id, gender, is_verified, created_at, updated_at
     FROM users WHERE email = :email`,
    { email }
  );
  return rows[0] || null;
}

export async function createUser(input: {
  email: string;
  password_hash: string;
  role_id?: number; // defaults to 1 = user
  gender: "male" | "female";
}) {
  const role_id = input.role_id ?? 1;
  const rows = await query<{ insertId: number }>(
    `INSERT INTO users (email, password_hash, role_id, gender)
     VALUES (:email, :password_hash, :role_id, :gender)`,
    { ...input, role_id }
  );
  // mysql2 returns OkPacket usually; if you prefer, switch to pool.execute and destructure OkPacket
  // For simplicity, fetch newly created user:
  const created = await getUserByEmail(input.email);
  return created!;
}
