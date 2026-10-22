// app/api/profile/avatar/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';

const MAX_AVATAR_LENGTH = 200_000;
const DATA_URL = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function PUT(request: Request) {
  if (!sql) return fail('Database is not configured', 500);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return fail('Invalid request body', 400);

  const userId = Number(body.userId);
  if (!Number.isInteger(userId) || userId <= 0) return fail('Invalid user ID', 400);

  const avatar = body.avatar;
  if (typeof avatar !== 'string' || !avatar) return fail('Avatar image is required', 400);
  if (avatar.length > MAX_AVATAR_LENGTH) return fail('Image is too large', 413);
  if (!DATA_URL.test(avatar)) return fail('Unsupported image format', 400);

  try {
    const rows = await query<{ avatar_url: string }>(
      `UPDATE users
       SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING avatar_url`,
      [avatar, userId]
    );

    if (rows.length === 0) return fail('User not found', 404);
    return NextResponse.json({ success: true, avatar_url: rows[0].avatar_url });
  } catch (error) {
    console.error('Avatar save error:', error);
    return fail('Failed to save profile photo', 500);
  }
}