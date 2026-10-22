// lib/admin-auth.ts
import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { notFound, redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

export interface AdminUser {
  user_id: number;
  full_name: string;
  email: string;
}

export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  let userId: number | null = null;
  try {
    userId = verifySessionToken(token);
  } catch {
    return null;
  }
  if (!userId) return null;

  const rows = await query<AdminUser>(
    `SELECT user_id::int AS user_id, full_name, email
     FROM users
     WHERE user_id = $1 AND role = 'admin' AND is_active = TRUE`,
    [userId]
  );
  return rows[0] ?? null;
});

export async function requireAdminPage(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (admin) return admin;

  const hasSession = Boolean((await cookies()).get(SESSION_COOKIE)?.value);
  if (hasSession) notFound();
  redirect('/login');
}