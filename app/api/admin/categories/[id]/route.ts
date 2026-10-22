// app/api/admin/categories/[id]/route.ts
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
  if (!id) return fail('Invalid category ID', 400);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return fail('Invalid request body', 400);

  const name = str(body.name);
  const slug = str(body.slug);
  const parentId = optId(body.parent_id);
  const imageUrl = optUrl(body.image_url);

  if (!name || name.length > 100) return fail('Enter a name (max 100 characters)', 400);
  if (!slug || slug.length > 150 || !SLUG_RE.test(slug)) return fail('Slug may only contain lowercase letters, numbers and dashes', 400);
  if (parentId === undefined) return fail('Invalid parent category', 400);
  if (imageUrl === undefined) return fail('Image URL must be a valid http(s) URL', 400);
  if (typeof body.is_active !== 'boolean') return fail('Invalid status', 400);

  try {
    if (parentId !== null) {
      if (parentId === id) return fail('A category cannot be its own parent', 400);
      const cycle = await query(
        `WITH RECURSIVE descendants AS (
           SELECT category_id FROM categories WHERE parent_id = $1
           UNION
           SELECT c.category_id FROM categories c JOIN descendants d ON c.parent_id = d.category_id
         )
         SELECT 1 FROM descendants WHERE category_id = $2`,
        [id, parentId]
      );
      if (cycle.length > 0) return fail('A category cannot be moved under its own subcategory', 400);
    }

    const rows = await query(
      `UPDATE categories
       SET name = $1, slug = $2, parent_id = $3, description = $4, image_url = $5, is_active = $6
       WHERE category_id = $7
       RETURNING category_id`,
      [name, slug, parentId, optStr(body.description), imageUrl, body.is_active, id]
    );
    if (rows.length === 0) return fail('Category not found', 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    const code = pgCode(error);
    if (code === '23505') return fail('A category with this slug already exists', 409);
    if (code === '23503') return fail('Parent category does not exist', 400);
    console.error('Admin category update error:', error);
    return fail('Failed to update category', 500);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!sql) return fail('Database is not configured', 500);
  if (!(await getAdmin())) return fail('Forbidden', 403);

  const id = await parseId(ctx);
  if (!id) return fail('Invalid category ID', 400);

  try {
    const usage = await query<{ products: number; children: number }>(
      `SELECT (SELECT COUNT(*) FROM products WHERE category_id = $1)::int AS products,
              (SELECT COUNT(*) FROM categories WHERE parent_id = $1)::int AS children`,
      [id]
    );
    const { products = 0, children = 0 } = usage[0] ?? {};
    if (products > 0) return fail(`This category still has ${products} product${products === 1 ? '' : 's'}. Move or delete them first.`, 409);
    if (children > 0) return fail(`This category still has ${children} subcategor${children === 1 ? 'y' : 'ies'}. Move or delete them first.`, 409);

    const rows = await query(`DELETE FROM categories WHERE category_id = $1 RETURNING category_id`, [id]);
    if (rows.length === 0) return fail('Category not found', 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (pgCode(error) === '23503') return fail('This category is still in use', 409);
    console.error('Admin category delete error:', error);
    return fail('Failed to delete category', 500);
  }
}