// app/api/admin/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { getAdmin } from '@/lib/admin-auth';
import { SLUG_RE, fail, optId, optStr, optUrl, pgCode, str } from '@/lib/admin-validate';

type Ctx = { params: Promise<{ id: string }> };

async function parseId(ctx: Ctx) {
  const id = Number((await ctx.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, ctx: Ctx) {
  if (!sql) return fail('Database is not configured', 500);
  if (!(await getAdmin())) return fail('Forbidden', 403);

  const id = await parseId(ctx);
  if (!id) return fail('Invalid product ID', 400);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return fail('Invalid request body', 400);

  const name = str(body.name);
  const slug = str(body.slug);
  const categoryId = optId(body.category_id);
  const brandId = optId(body.brand_id);
  const imageUrl = optUrl(body.image_url);

  if (!name || name.length > 250) return fail('Enter a name (max 250 characters)', 400);
  if (!slug || slug.length > 250 || !SLUG_RE.test(slug)) return fail('Slug may only contain lowercase letters, numbers and dashes', 400);
  if (!categoryId) return fail('Choose a category', 400);
  if (brandId === undefined) return fail('Invalid brand', 400);
  if (imageUrl === undefined) return fail('Image URL must be a valid http(s) URL', 400);
  if (typeof body.is_active !== 'boolean') return fail('Invalid status', 400);

  try {
    const rows = await query(
      `UPDATE products
       SET category_id = $1, brand_id = $2, name = $3, slug = $4, description = $5,
           model_number = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $8
       RETURNING product_id`,
      [categoryId, brandId, name, slug, optStr(body.description), optStr(body.model_number), body.is_active, id]
    );
    if (rows.length === 0) return fail('Product not found', 404);

    if (imageUrl === null) {
      await query(`DELETE FROM product_images WHERE product_id = $1 AND is_main = TRUE`, [id]);
    } else {
      const updated = await query(
        `UPDATE product_images SET image_url = $1, alt_text = $2
         WHERE product_id = $3 AND is_main = TRUE RETURNING image_id`,
        [imageUrl, name, id]
      );
      if (updated.length === 0) {
        await query(
          `INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_main)
           VALUES ($1, $2, $3, 0, TRUE)`,
          [id, imageUrl, name]
        );
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const code = pgCode(error);
    if (code === '23505') return fail('A product with this slug already exists', 409);
    if (code === '23503') return fail('Category or brand does not exist', 400);
    console.error('Admin product update error:', error);
    return fail('Failed to update product', 500);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!sql) return fail('Database is not configured', 500);
  if (!(await getAdmin())) return fail('Forbidden', 403);

  const id = await parseId(ctx);
  if (!id) return fail('Invalid product ID', 400);

  try {
    const inCarts = await query<{ n: number }>(
      `SELECT COUNT(*)::int AS n FROM cart_items ci
       JOIN product_variants v ON v.variant_id = ci.variant_id
       WHERE v.product_id = $1`,
      [id]
    );
    if ((inCarts[0]?.n ?? 0) > 0) {
      return fail('This product is in customers’ carts. Hide it from the store instead of deleting it.', 409);
    }

    const rows = await query(`DELETE FROM products WHERE product_id = $1 RETURNING product_id`, [id]);
    if (rows.length === 0) return fail('Product not found', 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (pgCode(error) === '23503') return fail('This product is still in use. Hide it instead.', 409);
    console.error('Admin product delete error:', error);
    return fail('Failed to delete product', 500);
  }
}