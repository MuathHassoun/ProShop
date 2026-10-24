// app/api/admin/variants/[id]/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { getAdmin } from '@/lib/admin-auth';
import { notify } from '@/lib/notifications';
import { formatPrice } from '@/lib/format';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
const money = (n: number) => Math.round(n * 100) / 100;

interface VariantRow {
  product_id: number;
  price: string;
  discount_price: string | null;
  stock_quantity: number;
  is_active: boolean;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sql) return fail('Database is not configured', 500);
  if (!(await getAdmin())) return fail('Forbidden', 403);

  const variantId = Number((await params).id);
  if (!Number.isInteger(variantId) || variantId <= 0) return fail('Invalid variant ID', 400);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return fail('Invalid request body', 400);

  try {
    const current = (
      await query<VariantRow>(
        `SELECT product_id::int AS product_id, price, discount_price, stock_quantity, is_active
         FROM product_variants WHERE variant_id = $1`,
        [variantId]
      )
    )[0];
    if (!current) return fail('Variant not found', 404);

    let price = Number(current.price);
    if ('price' in body) {
      price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) return fail('Price must be 0 or more', 400);
      price = money(price);
    }

    let discount: number | null = current.discount_price === null ? null : Number(current.discount_price);
    if ('discount_price' in body) {
      if (body.discount_price === null || body.discount_price === '') {
        discount = null;
      } else {
        discount = Number(body.discount_price);
        if (!Number.isFinite(discount) || discount < 0) return fail('Discount price must be 0 or more', 400);
        discount = money(discount);
      }
    }
    if (discount !== null && discount > price) return fail('Discount price cannot exceed the price', 400);

    let stock = current.stock_quantity;
    if ('stock_quantity' in body) {
      stock = Number(body.stock_quantity);
      if (!Number.isInteger(stock) || stock < 0) return fail('Stock must be a whole number, 0 or more', 400);
    }

    let isActive = current.is_active;
    if ('is_active' in body) {
      if (typeof body.is_active !== 'boolean') return fail('Invalid status', 400);
      isActive = body.is_active;
    }

    await query(
      `UPDATE product_variants
       SET price = $1, discount_price = $2, stock_quantity = $3, is_active = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE variant_id = $5`,
      [price, discount, stock, isActive, variantId]
    );

    const priceChanged =
      price !== Number(current.price) ||
      discount !== (current.discount_price === null ? null : Number(current.discount_price));
    if (priceChanged) {
      await query(
        `INSERT INTO price_history (variant_id, price, discount_price) VALUES ($1, $2, $3)`,
        [variantId, price, discount]
      );
    }

    if ('product_active' in body) {
      if (typeof body.product_active !== 'boolean') return fail('Invalid status', 400);
      await query(
        `UPDATE products SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE product_id = $2`,
        [body.product_active, current.product_id]
      );
    }

    const oldEffective = current.discount_price !== null ? Number(current.discount_price) : Number(current.price);
    const newEffective = discount ?? price;
    const priceDropped = newEffective < oldEffective;
    const backInStock = current.stock_quantity === 0 && stock > 0;

    if (isActive && (priceDropped || backInStock)) {
      const product = (
        await query<{ name: string; slug: string }>(
          `SELECT name, slug FROM products WHERE product_id = $1 AND is_active = TRUE`,
          [current.product_id]
        )
      )[0];

      if (product) {
        const fans = await query<{ user_id: number }>(
          `SELECT user_id::int AS user_id FROM wishlist_items WHERE product_id = $1`,
          [current.product_id]
        );
        const ids = fans.map((f) => f.user_id);
        const link = `/product/${product.slug}`;

        if (priceDropped) {
          await notify(ids, {
            type: 'price_drop',
            title: `Price drop: ${product.name}`,
            body: `Now ${formatPrice(newEffective)}`,
            link,
          });
        }
        if (backInStock) {
          await notify(ids, { type: 'back_in_stock', title: `Back in stock: ${product.name}`, link });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin variant update error:', error);
    return fail('Failed to update product', 500);
  }
}