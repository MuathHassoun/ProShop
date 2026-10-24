// components/notifications/NotificationsView.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useMounted } from '@/store/useWishlist';
import { formatDate } from '@/lib/format';
import {
  NOTIFICATION_TYPES,
  resolvePrefs,
  type AppNotification,
  type NotificationPrefs,
  type NotificationType,
} from '@/lib/notification-types';

type Status = 'loading' | 'ready' | 'error';
type Filter = 'all' | 'unread';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function api(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const tabClass = (active: boolean) =>
  `min-h-9 cursor-pointer rounded-lg px-3 text-sm font-medium transition-colors ${
    active ? 'bg-[#fdde0b] text-[#252525]' : 'text-[#555555] hover:bg-[#f5f5f5]'
  }`;

export function NotificationsView() {
  const mounted = useMounted();
  const router = useRouter();
  const user = useAppSelector((s) => s.user.userInfo);
  const userId = user?.user_id;

  const [items, setItems] = useState<AppNotification[]>([]);
  const [prefs, setPrefs] = useState<NotificationPrefs>(resolvePrefs(null));
  const [status, setStatus] = useState<Status>('loading');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    Promise.all([api('/api/notifications'), api('/api/notifications/prefs')])
      .then(([n, p]) => {
        if (cancelled) return;
        setItems(n.notifications ?? []);
        setPrefs(p.prefs);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!mounted) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-[#555555]">Sign in to see your notifications.</p>
        <Link href="/login" className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-[#fdde0b] px-4 text-sm font-semibold text-[#252525]">
          Sign in
        </Link>
      </div>
    );
  }

  const unread = items.filter((i) => !i.is_read).length;
  const visible = filter === 'unread' ? items.filter((i) => !i.is_read) : items;

  const markRead = (target: number[] | 'all') => {
    setItems((list) =>
      list.map((i) => (target === 'all' || target.includes(i.notification_id) ? { ...i, is_read: true } : i))
    );
    api('/api/notifications', {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify(target === 'all' ? { all: true } : { ids: target }),
    }).catch(() => {});
  };

  const remove = (id: number) => {
    setItems((list) => list.filter((i) => i.notification_id !== id));
    api(`/api/notifications?id=${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const open = (n: AppNotification) => {
    if (!n.is_read) markRead([n.notification_id]);
    if (n.link) router.push(n.link);
  };

  const savePrefs = (next: NotificationPrefs) => {
    setPrefs(next);
    api('/api/notifications/prefs', {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ prefs: next }),
    }).catch(() => {});
  };

  const types = Object.keys(NOTIFICATION_TYPES) as NotificationType[];
  const allMuted = types.every((t) => !prefs[t]);

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-[#252525]">Notifications</h1>
          <button
            type="button"
            onClick={() => markRead('all')}
            disabled={unread === 0}
            className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#555555] hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={16} aria-hidden="true" /> Mark all as read
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button type="button" className={tabClass(filter === 'all')} onClick={() => setFilter('all')}>
            All
          </button>
          <button type="button" className={tabClass(filter === 'unread')} onClick={() => setFilter('unread')}>
            Unread{unread > 0 ? ` (${unread})` : ''}
          </button>
        </div>

        {status === 'loading' && <p className="mt-6 text-sm text-[#888888]">Loading…</p>}
        {status === 'error' && <p className="mt-6 text-sm text-red-600">Could not load your notifications.</p>}

        {status === 'ready' && visible.length === 0 && (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#e5e5e5] px-6 py-16 text-center">
            <Bell size={28} className="text-[#bbbbbb]" aria-hidden="true" />
            <p className="text-sm text-[#555555]">
              {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
            </p>
          </div>
        )}

        <ul className="mt-4 space-y-2">
          {visible.map((n) => (
            <li
              key={n.notification_id}
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                n.is_read ? 'border-[#eeeeee] bg-white' : 'border-[#fdde0b] bg-[#fffbe0]'
              }`}
            >
              <button type="button" onClick={() => open(n)} className="min-w-0 flex-1 cursor-pointer text-left">
                <span className="block text-sm font-semibold text-[#252525]">{n.title}</span>
                {n.body && <span className="mt-0.5 block text-sm text-[#555555]">{n.body}</span>}
                <span className="mt-1 block text-xs text-[#999999]">{formatDate(n.created_at)}</span>
              </button>
              <button
                type="button"
                onClick={() => remove(n.notification_id)}
                aria-label="Delete notification"
                className="cursor-pointer rounded-lg p-2 text-[#999999] hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <aside className="h-fit rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-[#252525]">Preferences</h2>
        <ul className="mt-3 space-y-3">
          {types.map((type) => (
            <li key={type}>
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-[#252525]">
                {NOTIFICATION_TYPES[type]}
                <input
                  type="checkbox"
                  checked={prefs[type]}
                  onChange={(e) => savePrefs({ ...prefs, [type]: e.target.checked })}
                  className="size-4 accent-[#252525]"
                />
              </label>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => savePrefs(Object.fromEntries(types.map((t) => [t, allMuted])) as NotificationPrefs)}
          className="mt-4 min-h-9 w-full cursor-pointer rounded-lg border border-[#e5e5e5] text-sm font-medium text-[#555555] hover:bg-[#f5f5f5]"
        >
          {allMuted ? 'Turn all on' : 'Mute all'}
        </button>
      </aside>
    </div>
  );
}