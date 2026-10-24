// lib/notifications.ts
import 'server-only';
import { query } from '@/lib/db';
import type { NotificationType } from '@/lib/notification-types';

interface NotifyInput {
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

export async function notify(userIds: number | number[], n: NotifyInput) {
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  if (ids.length === 0) return;

  try {
    await query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       SELECT u.user_id, $2::text, $3::text, $4::text, $5::text
       FROM users u
       WHERE u.user_id IN (SELECT jsonb_array_elements_text($1::jsonb)::bigint)
         AND u.is_active = TRUE
         AND COALESCE((u.notification_prefs ->> $2::text)::boolean, TRUE)`,
      [JSON.stringify(ids), n.type, n.title, n.body ?? null, n.link ?? null]
    );
  } catch (error) {
    console.error('Notification error:', error);
  }
}