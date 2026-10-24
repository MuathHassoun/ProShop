// lib/user-auth.ts
import 'server-only';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

export async function getSessionUserId(): Promise<number | null> {
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  try {
    return verifySessionToken(token);
  } catch {
    return null;
  }
}