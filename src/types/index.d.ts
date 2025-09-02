// Shared types
export type Role = "user" | "moderator" | "admin";
export type Gender = "male" | "female";

export interface invitation {
  id: number;
  user_a: number;
  user_b: number;
  initiated_by: number;
  status: "pending" | "active" | "declined" | "ended" | "blocked";
  approved_at: Date | null;
  ended_at: Date | null;
  ended_by: number | null;
  chat_session_id: number | null;
  is_open: boolean;
  created_at: Date;
  updated_at: Date;
}
