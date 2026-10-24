// app/api/notifications/prefs/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { getSessionUserId } from '@/lib/user-auth';
import { NOTIFICATION_TYPES, resolvePrefs, type NotificationType } from '@/lib/notification-types';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function GET() {
  if (!sql) return fail('Database is not configured', 500);
  const userId = await getSessionUserId();
  if (!userId) return fail('Unauthorized', 401);

  try {
    const rows = await query<{ notification_prefs: unknown }>(
      `SELECT notification_prefs FROM users WHERE user_id = $1`,
      [userId]
    );
    return NextResponse.json({ prefs: resolvePrefs(rows[0]?.notification_prefs) });
  } catch (error) {
    console.error('Prefs fetch error:', error);
    return fail('Could not load preferences', 500);
  }
}

export async function PUT(request: Request) {
  if (!sql) return fail('Database is not configured', 500);
  const userId = await getSessionUserId();
  if (!userId) return fail('Unauthorized', 401);

  const body = await request.json().catch(() => null);
  const incoming = body?.prefs;
  if (!incoming || typeof incoming !== 'object') return fail('Invalid request body', 400);

  const patch: Partial<Record<NotificationType, boolean>> = {};
  for (const type of Object.keys(NOTIFICATION_TYPES) as NotificationType[]) {
    if (type in incoming) {
      if (typeof incoming[type] !== 'boolean') return fail(`Invalid value for ${type}`, 400);
      patch[type] = incoming[type];
    }
  }
  if (Object.keys(patch).length === 0) return fail('Nothing to update', 400);

  try {
    const rows = await query<{ notification_prefs: unknown }>(
      `UPDATE users
       SET notification_prefs = notification_prefs || $2::jsonb, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING notification_prefs`,
      [userId, JSON.stringify(patch)]
    );
    return NextResponse.json({ success: true, prefs: resolvePrefs(rows[0]?.notification_prefs) });
  } catch (error) {
    console.error('Prefs save error:', error);
    return fail('Could not save preferences', 500);
  }
}