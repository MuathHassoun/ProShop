// lib/notification-types.ts
export const NOTIFICATION_TYPES = {
    order_status: 'Order status',
    payment: 'Payment',
    price_drop: 'Price drops on your wishlist',
    back_in_stock: 'Back in stock',
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPES;
export type NotificationPrefs = Record<NotificationType, boolean>;

export interface AppNotification {
    notification_id: number;
    type: NotificationType;
    title: string;
    body: string | null;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

export function resolvePrefs(raw: unknown): NotificationPrefs {
    const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    return Object.fromEntries(
        (Object.keys(NOTIFICATION_TYPES) as NotificationType[]).map((t) => [t, source[t] !== false])
    ) as NotificationPrefs;
}