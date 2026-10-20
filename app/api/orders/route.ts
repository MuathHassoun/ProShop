// app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { computeTotals } from '@/lib/pricing';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

const CARD_BRANDS = ['Visa', 'Mastercard', 'American Express', 'Other'];
const clean = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const EFFECTIVE = `(CASE WHEN v.discount_price IS NOT NULL AND v.discount_price < v.price
                         THEN v.discount_price ELSE v.price END)`;

interface VariantRow {
  variant_id: number;
  stock_quantity: number;
  price: string;
  discount_price: string | null;
  is_active: boolean;
  product_active: boolean;
  product_name: string;
}

interface OrderRow {
  order_id: number;
  user_id: number;
  status: string;
  payment_status: string;
  total_amount: string;
  created_at: string | Date;
  shipping_address_snapshot: Record<string, unknown> | null;
  items: unknown[];
}

export async function GET(request: Request) {
  if (!sql) return fail('Database is not configured', 500);

  const userId = Number(new URL(request.url).searchParams.get('userId'));
  if (!Number.isInteger(userId) || userId <= 0) return fail('Valid userId is required', 400);

  try {
    const rows = await query<OrderRow>(
      `SELECT o.order_id::int AS order_id, o.user_id::int AS user_id, o.status, o.payment_status,
              o.total_amount, o.created_at, o.shipping_address_snapshot,
              COALESCE((
                SELECT json_agg(json_build_object(
                         'order_item_id', i.order_item_id::int,
                         'order_id', i.order_id::int,
                         'product_name', i.product_name,
                         'variant_name', i.variant_name,
                         'quantity', i.quantity,
                         'unit_price', i.unit_price
                       ) ORDER BY i.order_item_id)
                FROM order_items i
                WHERE i.order_id = o.order_id
              ), '[]'::json) AS items
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC, o.order_id DESC
       LIMIT 100`,
      [userId]
    );

    const orders = rows.map((r) => ({
      ...r,
      total_amount: Number(r.total_amount),
      created_at: new Date(r.created_at).toISOString(),
    }));
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return fail('Could not load your orders', 500);
  }
}

export async function POST(request: Request) {
  const db = sql;
  if (!db) return fail('Database is not configured', 500);

  const body = await request.json().catch(() => null);

  const userId = Number(body?.userId);
  if (!Number.isInteger(userId) || userId <= 0) return fail('Valid userId is required', 400);

  const rawItems: unknown = body?.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 50) {
    return fail('Your cart is empty', 400);
  }
  const qtyByVariant = new Map<number, number>();
  for (const it of rawItems) {
    const id = Number(it?.variant_id);
    const qty = Number(it?.quantity);
    if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return fail('Invalid cart item', 400);
    }
    qtyByVariant.set(id, (qtyByVariant.get(id) ?? 0) + qty);
  }

  const a = body?.address ?? {};
  const address = {
    recipient_name: clean(a.recipient_name, 150),
    phone: clean(a.phone, 30) || null,
    country: clean(a.country, 100),
    city: clean(a.city, 100),
    zip_code: clean(a.zip_code, 20),
    street_address: clean(a.street_address, 255),
  };
  if (!address.recipient_name || !address.country || !address.city || !address.street_address) {
    return fail('Name, country, city and street address are required', 400);
  }

  const p = body?.payment ?? {};
  const payment = {
    card_brand: clean(p.card_brand, 30),
    last_four: clean(p.last_four, 4),
    exp_month: Number(p.exp_month),
    exp_year: Number(p.exp_year),
  };
  if (!CARD_BRANDS.includes(payment.card_brand)) return fail('Choose a valid card type', 400);
  if (!/^\d{4}$/.test(payment.last_four)) return fail('Invalid card details', 400);
  const now = new Date();
  if (
    !Number.isInteger(payment.exp_month) ||
    payment.exp_month < 1 ||
    payment.exp_month > 12 ||
    !Number.isInteger(payment.exp_year) ||
    payment.exp_year < now.getFullYear() ||
    (payment.exp_year === now.getFullYear() && payment.exp_month < now.getMonth() + 1)
  ) {
    return fail('This card has expired', 400);
  }

  try {
    const ids = [...qtyByVariant.keys()];
    const rows = await query<VariantRow>(
      `SELECT v.variant_id::int AS variant_id, v.stock_quantity, v.price, v.discount_price,
              v.is_active, p.is_active AS product_active, p.name AS product_name
       FROM product_variants v
       JOIN products p ON p.product_id = v.product_id
       WHERE v.variant_id IN (SELECT jsonb_array_elements_text($1::jsonb)::bigint)`,
      [JSON.stringify(ids)]
    );
    const byId = new Map(rows.map((r) => [Number(r.variant_id), r]));

    let cents = 0;
    const lines: { variant_id: number; quantity: number }[] = [];
    for (const [id, quantity] of qtyByVariant) {
      const r = byId.get(id);
      if (!r || !r.is_active || !r.product_active) {
        return fail('An item in your cart is no longer available', 409);
      }
      if (r.stock_quantity < quantity) {
        return fail(`Only ${r.stock_quantity} left of "${r.product_name}"`, 409);
      }
      const price = Number(r.price);
      const discount = r.discount_price == null ? null : Number(r.discount_price);
      const unit = discount !== null && discount < price ? discount : price;
      cents += Math.round(unit * 100) * quantity;
      lines.push({ variant_id: id, quantity });
    }
    const totals = computeTotals(cents / 100);

    const [{ id: orderId }] = await query<{ id: string }>(
      `SELECT nextval(pg_get_serial_sequence('orders', 'order_id'))::text AS id`
    );
    const itemsJson = JSON.stringify(lines);
    const addressJson = JSON.stringify(address);
    const paymentJson = JSON.stringify({ ...payment });

    await db.transaction((txn) => [
      // 1) Decrement stock. CHECK (stock_quantity >= 0) aborts everything if short.
      txn.query(
        `UPDATE product_variants v
         SET stock_quantity = v.stock_quantity - r.quantity, updated_at = CURRENT_TIMESTAMP
         FROM jsonb_to_recordset($1::jsonb) AS r(variant_id bigint, quantity int)
         WHERE v.variant_id = r.variant_id`,
        [itemsJson]
      ),

      // 2) Insert the order only if prices still match what we calculated.
      txn.query(
        `INSERT INTO orders (order_id, user_id, address_id, payment_method_id,
                             subtotal_amount, shipping_amount, tax_amount, total_amount,
                             shipping_address_snapshot, payment_snapshot)
         SELECT $1::bigint, $2::bigint,
                (SELECT address_id FROM shipping_addresses
                  WHERE user_id = $2::bigint AND is_default
                    AND street_address = ($7::jsonb ->> 'street_address')
                    AND city = ($7::jsonb ->> 'city') LIMIT 1),
                (SELECT payment_method_id FROM payment_methods
                  WHERE user_id = $2::bigint AND provider = 'saved_card'
                    AND last_four = ($8::jsonb ->> 'last_four') LIMIT 1),
                $3::numeric, $4::numeric, $5::numeric, $6::numeric,
                $7::jsonb, $8::jsonb
         WHERE (
           SELECT COALESCE(SUM(${EFFECTIVE} * r.quantity), 0)
           FROM jsonb_to_recordset($9::jsonb) AS r(variant_id bigint, quantity int)
           JOIN product_variants v ON v.variant_id = r.variant_id
         ) = $3::numeric`,
        [
          orderId,
          userId,
          totals.itemsPrice,
          totals.shippingPrice,
          totals.taxPrice,
          totals.totalPrice,
          addressJson,
          paymentJson,
          itemsJson,
        ]
      ),

      // 3) Items. If step 2 inserted nothing, the FK fails and everything rolls back.
      txn.query(
        `INSERT INTO order_items (order_id, variant_id, product_name, variant_name, sku,
                                  quantity, unit_price)
         SELECT $1::bigint, v.variant_id, p.name, v.variant_name, v.sku, r.quantity, ${EFFECTIVE}
         FROM jsonb_to_recordset($2::jsonb) AS r(variant_id bigint, quantity int)
         JOIN product_variants v ON v.variant_id = r.variant_id
         JOIN products p ON p.product_id = v.product_id`,
        [orderId, itemsJson]
      ),
    ]);

    return NextResponse.json({ orderId: Number(orderId), total: totals.totalPrice }, { status: 201 });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === '23514' || code === '23503') {
      return fail(
        'An item went out of stock or its price changed. Please review your cart and try again.',
        409
      );
    }
    console.error('Order create error:', error);
    return fail('Could not place your order', 500);
  }
}