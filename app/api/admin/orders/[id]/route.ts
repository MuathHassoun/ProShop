// app/api/admin/orders/[id]/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { getAdmin } from '@/lib/admin-auth';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/admin-data';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

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
    return NextResponse.json({ success: true, order: rows[0] });
  } catch (error) {
    console.error('Admin order update error:', error);
    return fail('Failed to update order', 500);
  }
}
