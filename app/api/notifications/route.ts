// app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { getSessionUserId } from '@/lib/user-auth';
import type { AppNotification } from '@/lib/notification-types';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function GET() {
  if (!sql) return fail('Database is not configured', 500);
  const userId = await getSessionUserId();
  if (!userId) return fail('Unauthorized', 401);

  try {
    const [notifications, counts] = await Promise.all([
      query<AppNotification>(
        `SELECT notification_id::int AS notification_id, type, title, body, link, is_read, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [userId]
      ),
      query<{ unread: number }>(
        `SELECT COUNT(*)::int AS unread FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
        [userId]
      ),
    ]);
    return NextResponse.json({ notifications, unread: counts[0]?.unread ?? 0 });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return fail('Could not load notifications', 500);
  }
}

export async function PATCH(request: Request) {
  if (!sql) return fail('Database is not configured', 500);
  const userId = await getSessionUserId();
  if (!userId) return fail('Unauthorized', 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return fail('Invalid request body', 400);

  try {
    if (body.all === true) {
      await query(
        `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
        [userId]
      );
    } else if (Array.isArray(body.ids) && body.ids.length > 0) {
      const ids = body.ids.map(Number);
      if (!ids.every((n: number) => Number.isInteger(n) && n > 0)) return fail('Invalid ids', 400);
      await query(
        `UPDATE notifications SET is_read = TRUE
         WHERE user_id = $1
           AND notification_id IN (SELECT jsonb_array_elements_text($2::jsonb)::bigint)`,
        [userId, JSON.stringify(ids)]
      );
    } else {
      return fail('Nothing to update', 400);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications update error:', error);
    return fail('Could not update notifications', 500);
  }
}

export async function DELETE(request: Request) {
  if (!sql) return fail('Database is not configured', 500);
  const userId = await getSessionUserId();
  if (!userId) return fail('Unauthorized', 401);

  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return fail('Invalid id', 400);

  try {
    await query(`DELETE FROM notifications WHERE notification_id = $1 AND user_id = $2`, [id, userId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications delete error:', error);
    return fail('Could not delete notification', 500);
  }
}