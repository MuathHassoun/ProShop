// app/api/wishlist/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { getWishlistProducts } from '@/lib/products';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

function parseId(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(request: Request) {
  if (!sql) return fail('Database is not configured', 500);

  const userId = parseId(new URL(request.url).searchParams.get('userId'));
  if (!userId) return fail('Valid userId is required', 400);

  try {
    return NextResponse.json({ items: await getWishlistProducts(userId) });
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return fail('Could not load wishlist', 500);
  }
}

export async function POST(request: Request) {
  if (!sql) return fail('Database is not configured', 500);

  const body = await request.json().catch(() => null);
  const userId = parseId(body?.userId);
  const productId = parseId(body?.productId);
  if (!userId || !productId) return fail('userId and productId are required', 400);

  try {
    await query(
      `INSERT INTO wishlist_items (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [userId, productId]
    );
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === '23503') return fail('User or product not found', 404);
    console.error('Wishlist add error:', error);
    return fail('Could not add to wishlist', 500);
  }
}

export async function DELETE(request: Request) {
  if (!sql) return fail('Database is not configured', 500);

  const params = new URL(request.url).searchParams;
  const userId = parseId(params.get('userId'));
  if (!userId) return fail('Valid userId is required', 400);

  const rawProduct = params.get('productId');
  const productId = rawProduct === null ? null : parseId(rawProduct);
  if (rawProduct !== null && !productId) return fail('Invalid productId', 400);

  try {
    if (productId) {
      await query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', [userId, productId]);
    } else {
      await query('DELETE FROM wishlist_items WHERE user_id = $1', [userId]);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    return fail('Could not update wishlist', 500);
  }
}
