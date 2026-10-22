// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { getAdmin } from '@/lib/admin-auth';
import { hashPassword } from '@/lib/password';
import { isEmail, MIN_PASSWORD_LENGTH } from '@/components/auth/validation';
import { fail, optStr, pgCode, str } from '@/lib/admin-validate';

const MAX_PASSWORD = 128;

export async function POST(request: Request) {
  if (!sql) return fail('Database is not configured', 500);
  if (!(await getAdmin())) return fail('Forbidden', 403);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return fail('Invalid request body', 400);

  const name = str(body.full_name);
  const email = str(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const role = body.role ?? 'customer';
  const isActive = body.is_active ?? true;
  const phone = optStr(body.phone);

  if (!name || name.length > 150) return fail('Enter a valid name', 400);
  if (!isEmail(email) || email.length > 150) return fail('Enter a valid email address', 400);
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD) {
    return fail(`Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD} characters`, 400);
  }
  if (role !== 'admin' && role !== 'customer') return fail('Invalid role', 400);
  if (typeof isActive !== 'boolean') return fail('Invalid status', 400);
  if (phone && phone.length > 30) return fail('Phone number is too long', 400);

  try {
    const rows = await query<{ user_id: number }>(
      `INSERT INTO users (full_name, email, password_hash, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING user_id::int AS user_id`,
      [name, email, await hashPassword(password), phone, role, isActive]
    );
    if (rows.length === 0) return fail('An account with this email already exists', 409);
    return NextResponse.json({ success: true, user: rows[0] }, { status: 201 });
  } catch (error) {
    if (pgCode(error) === '23505') return fail('An account with this email already exists', 409);
    console.error('Admin user create error:', error);
    return fail('Failed to create user', 500);
  }
}