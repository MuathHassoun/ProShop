// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/session';
import type { User } from '@/types';

type UserRow = User & { password_hash: string; is_active: boolean };

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password ?? '';

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  try {
    const rows = await query<UserRow>(
      `SELECT user_id, full_name, email, phone, role, created_at,
              to_char(birthday, 'YYYY-MM-DD') AS birthday, avatar_url, is_active, password_hash
       FROM users WHERE email = $1`,
      [email]
    );

    const row = rows[0];
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    if (!row.is_active) {
      return NextResponse.json({ message: 'This account has been deactivated' }, { status: 403 });
    }

    const { password_hash: _omit, is_active: _active, ...user } = row;
    void _omit;
    void _active;

    const res = NextResponse.json({ user });
    res.cookies.set(SESSION_COOKIE, createSessionToken(Number(user.user_id)), sessionCookieOptions);
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Could not sign in' }, { status: 500 });
  }
}