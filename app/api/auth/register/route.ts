// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { isEmail, MIN_PASSWORD_LENGTH } from '@/components/auth/validation';
import type { User } from '@/types';

const MAX_NAME = 150;
const MAX_EMAIL = 150;
const MAX_PASSWORD = 128;

const fail = (message: string, status: number) => NextResponse.json({ message }, { status });
const text = (value: unknown) => (typeof value === 'string' ? value : '');

export async function POST(request: Request) {
  if (!sql) return fail('Database is not configured', 500);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return fail('Invalid request body', 400);

  const name = text(body.name).trim();
  const email = text(body.email).trim().toLowerCase();
  const password = text(body.password);

  if (!name || name.length > MAX_NAME) return fail('Enter a valid name', 400);
  if (!isEmail(email) || email.length > MAX_EMAIL) return fail('Enter a valid email address', 400);
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD) {
    return fail(`Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD} characters`, 400);
  }

  try {
    const rows = await query<User>(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING user_id, full_name, email, phone, role, created_at,
                 to_char(birthday, 'YYYY-MM-DD') AS birthday`,
      [name, email, await hashPassword(password)]
    );

    if (rows.length === 0) return fail('An account with this email already exists', 409);
    return NextResponse.json({ user: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return fail('Could not create account', 500);
  }
}
