// app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { getAdmin } from '@/lib/admin-auth';
import { hashPassword } from '@/lib/password';
import { isEmail, MIN_PASSWORD_LENGTH } from '@/components/auth/validation';
import { pgCode } from '@/lib/admin-validate';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
const MAX_PASSWORD = 128;

type Ctx = { params: Promise<{ id: string }> };

async function parseId(ctx: Ctx) {
  const id = Number((await ctx.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, ctx: Ctx) {
  if (!sql) return fail('Database is not configured', 500);
  const admin = await getAdmin();
  if (!admin) return fail('Forbidden', 403);

  const userId = await parseId(ctx);
  if (!userId) return fail('Invalid user ID', 400);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return fail('Invalid request body', 400);

  const sets: string[] = [];
  const values: (string | number | boolean | null)[] = [];
  const add = (column: string, value: string | number | boolean | null) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if ('full_name' in body) {
    const name = typeof body.full_name === 'string' ? body.full_name.trim() : '';
    if (!name || name.length > 150) return fail('Enter a valid name', 400);
    add('full_name', name);
  }
  if ('email' in body) {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!isEmail(email) || email.length > 150) return fail('Enter a valid email address', 400);
    add('email', email);
  }
  if ('phone' in body) {
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    if (phone.length > 30) return fail('Phone number is too long', 400);
    add('phone', phone || null);
  }
  if ('password' in body && body.password !== '' && body.password !== undefined) {
    const password = typeof body.password === 'string' ? body.password : '';
    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD) {
      return fail(`Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD} characters`, 400);
    }
    add('password_hash', await hashPassword(password));
  }
  if ('role' in body) {
    if (body.role !== 'admin' && body.role !== 'customer') return fail('Invalid role', 400);
    if (userId === admin.user_id && body.role === 'customer') {
      return fail('You cannot demote or deactivate your own account', 400);
    }
    add('role', body.role);
  }
  if ('is_active' in body) {
    if (typeof body.is_active !== 'boolean') return fail('Invalid status', 400);
    if (userId === admin.user_id && body.is_active === false) {
      return fail('You cannot demote or deactivate your own account', 400);
    }
    add('is_active', body.is_active);
  }

  if (sets.length === 0) return fail('Nothing to update', 400);

  try {
    values.push(userId);
    const rows = await query(
      `UPDATE users SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $${values.length}
       RETURNING user_id::int AS user_id, role, is_active`,
      values
    );
    if (rows.length === 0) return fail('User not found', 404);
    return NextResponse.json({ success: true, user: rows[0] });
  } catch (error) {
    if (pgCode(error) === '23505') return fail('An account with this email already exists', 409);
    console.error('Admin user update error:', error);
    return fail('Failed to update user', 500);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!sql) return fail('Database is not configured', 500);
  const admin = await getAdmin();
  if (!admin) return fail('Forbidden', 403);

  const userId = await parseId(ctx);
  if (!userId) return fail('Invalid user ID', 400);
  if (userId === admin.user_id) return fail('You cannot delete your own account', 400);

  try {
    const orders = await query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM orders WHERE user_id = $1`, [userId]);
    if ((orders[0]?.n ?? 0) > 0) {
      return fail('This user has placed orders and can’t be deleted. Deactivate the account instead.', 409);
    }
    const rows = await query(`DELETE FROM users WHERE user_id = $1 RETURNING user_id`, [userId]);
    if (rows.length === 0) return fail('User not found', 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (pgCode(error) === '23503') return fail('This user is still referenced by other records. Deactivate the account instead.', 409);
    console.error('Admin user delete error:', error);
    return fail('Failed to delete user', 500);
  }
}