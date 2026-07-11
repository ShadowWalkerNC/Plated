/**
 * UserRecord — Supabase `users` table row shape.
 * Extends Supabase Auth user with Plated-specific fields.
 */
export interface UserRecord {
  id: string;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
}
