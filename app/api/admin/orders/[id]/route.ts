// app/api/admin/orders/[id]/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { getAdmin } from '@/lib/admin-auth';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/admin-data';
import { notify } from '@/lib/notifications';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

const STATUS_MESSAGES: Record<string, string> = {
  processing: 'is being prepared',
  shipped: 'has been shipped',
  delivered: 'was delivered',
  cancelled: 'was cancelled',
};
const PAYMENT_MESSAGES: Record<string, string> = {
  paid: 'Payment received',
  failed: 'Payment failed',
  refunded: 'Payment refunded',
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sql) return fail('Database is not configured', 500);
  if (!(await getAdmin())) return fail('Forbidden', 403);

  const orderId = Number((await params).id);
  if (!Number.isInteger(orderId) || orderId <= 0) return fail('Invalid order ID', 400);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return fail('Invalid request body', 400);

  const status = body.status ?? null;
  const paymentStatus = body.payment_status ?? null;

  if (status === null && paymentStatus === null) return fail('Nothing to update', 400);
  if (status !== null && !(ORDER_STATUSES as readonly string[]).includes(status)) {
    return fail('Invalid order status', 400);
  }
  if (paymentStatus !== null && !(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) {
    return fail('Invalid payment status', 400);
  }

  try {
    const before = (
      await query<{ user_id: number; status: string; payment_status: string }>(
        `SELECT user_id::int AS user_id, status, payment_status FROM orders WHERE order_id = $1`,
        [orderId]
      )
    )[0];
    if (!before) return fail('Order not found', 404);

    const rows = await query(
      `UPDATE orders
       SET status = COALESCE($1::text, status),
           payment_status = COALESCE($2::text, payment_status),
           updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $3
       RETURNING order_id::int AS order_id, status, payment_status`,
      [status, paymentStatus, orderId]
    );
    if (rows.length === 0) return fail('Order not found', 404);

    if (status !== null && status !== before.status && STATUS_MESSAGES[status]) {
      await notify(before.user_id, {
        type: 'order_status',
        title: `Order #${orderId} ${STATUS_MESSAGES[status]}`,
        link: '/orders',
      });
    }
    if (paymentStatus !== null && paymentStatus !== before.payment_status && PAYMENT_MESSAGES[paymentStatus]) {
      await notify(before.user_id, {
        type: 'payment',
        title: `${PAYMENT_MESSAGES[paymentStatus]} for order #${orderId}`,
        link: '/orders',
      });
    }

    return NextResponse.json({ success: true, order: rows[0] });
  } catch (error) {
    console.error('Admin order update error:', error);
    return fail('Failed to update order', 500);
  }
}