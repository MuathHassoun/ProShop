// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import type { User } from '@/types';

type UserRow = User & { password_hash: string };

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
      `SELECT user_id, full_name, email, phone, role, created_at, password_hash
       FROM users WHERE email = $1`,
      [email]
    );

    const row = rows[0];
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const { password_hash: _omit, ...user } = row;
    void _omit;
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Could not sign in' }, { status: 500 });
  }
}
