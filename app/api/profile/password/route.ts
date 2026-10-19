// app/api/profile/password/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { MIN_PASSWORD_LENGTH } from '@/components/auth/validation';

export async function PUT(request: Request) {
  let body: { userId?: number | string; currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const userId = Number(body.userId);
  const currentPassword = body.currentPassword ?? '';
  const newPassword = body.newPassword ?? '';

  if (!body.userId || Number.isNaN(userId)) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    );
  }
  if (newPassword === currentPassword) {
    return NextResponse.json(
      { error: 'New password must be different from the current one' },
      { status: 400 }
    );
  }

  try {
    const rows = await query<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [userId]
    );
    const row = rows[0];

    if (!row) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (!(await verifyPassword(currentPassword, row.password_hash))) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2', [
      await hashPassword(newPassword),
      userId,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Could not change password' }, { status: 500 });
  }
}
