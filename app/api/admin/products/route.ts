// app/api/admin/products/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { getAdmin } from '@/lib/admin-auth';
import { SLUG_RE, fail, money, optId, optStr, optUrl, pgCode, str } from '@/lib/admin-validate';

export async function POST(request: Request) {
  if (!sql) return fail('Database is not configured', 500);
  if (!(await getAdmin())) return fail('Forbidden', 403);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return fail('Invalid request body', 400);

  const name = str(body.name);
  const slug = str(body.slug);
  const categoryId = optId(body.category_id);
  const brandId = optId(body.brand_id);
  const imageUrl = optUrl(body.image_url);
  const isActive = body.is_active === undefined ? true : body.is_active;

  if (!name || name.length > 250) return fail('Enter a name (max 250 characters)', 400);
  if (!slug || slug.length > 250 || !SLUG_RE.test(slug)) return fail('Slug may only contain lowercase letters, numbers and dashes', 400);
  if (!categoryId) return fail('Choose a category', 400);
  if (brandId === undefined) return fail('Invalid brand', 400);
  if (imageUrl === undefined) return fail('Image URL must be a valid http(s) URL', 400);
  if (typeof isActive !== 'boolean') return fail('Invalid status', 400);

  const price = Number(body.price);
  if (body.price === '' || !Number.isFinite(price) || price < 0) return fail('Price must be 0 or more', 400);
  let discount: number | null = null;
  if (body.discount_price !== '' && body.discount_price !== null && body.discount_price !== undefined) {
    discount = Number(body.discount_price);
    if (!Number.isFinite(discount) || discount < 0) return fail('Discount price must be 0 or more', 400);
    if (discount > price) return fail('Discount price cannot exceed the price', 400);
    discount = money(discount);
  }
  const stock = Number(body.stock_quantity);
  if (!Number.isInteger(stock) || stock < 0) return fail('Stock must be a whole number, 0 or more', 400);

  try {
    const rows = await query<{ product_id: number }>(
      `WITH p AS (
         INSERT INTO products (category_id, brand_id, name, slug, description, model_number, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING product_id
       ), v AS (
         INSERT INTO product_variants (product_id, sku, variant_name, price, discount_price, stock_quantity)
         SELECT product_id, $8::text, $9::text, $10::numeric, $11::numeric, $12::int FROM p
         RETURNING variant_id, price, discount_price
       ), h AS (
         INSERT INTO price_history (variant_id, price, discount_price)
         SELECT variant_id, price, discount_price FROM v
       ), i AS (
         INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_main)
         SELECT product_id, $13::text, $3::text, 0, TRUE FROM p WHERE $13::text IS NOT NULL
       )
       SELECT product_id::int AS product_id FROM p`,
      [categoryId, brandId, name, slug, optStr(body.description), optStr(body.model_number), isActive,
       optStr(body.sku), optStr(body.variant_name), money(price), discount, stock, imageUrl]
    );
    return NextResponse.json({ success: true, product: rows[0] }, { status: 201 });
  } catch (error) {
    const code = pgCode(error);
    if (code === '23505') return fail('A product with this slug or SKU already exists', 409);
    if (code === '23503') return fail('Category or brand does not exist', 400);
    console.error('Admin product create error:', error);
    return fail('Failed to create product', 500);
  }
}