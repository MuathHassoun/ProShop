// app/api/admin/categories/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import { getAdmin } from '@/lib/admin-auth';
import { SLUG_RE, fail, optId, optStr, optUrl, pgCode, str } from '@/lib/admin-validate';

export async function POST(request: Request) {
  if (!sql) return fail('Database is not configured', 500);
  if (!(await getAdmin())) return fail('Forbidden', 403);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return fail('Invalid request body', 400);

  const name = str(body.name);
  const slug = str(body.slug);
  const parentId = optId(body.parent_id);
  const imageUrl = optUrl(body.image_url);
  const isActive = body.is_active === undefined ? true : body.is_active;

  if (!name || name.length > 100) return fail('Enter a name (max 100 characters)', 400);
  if (!slug || slug.length > 150 || !SLUG_RE.test(slug)) return fail('Slug may only contain lowercase letters, numbers and dashes', 400);
  if (parentId === undefined) return fail('Invalid parent category', 400);
  if (imageUrl === undefined) return fail('Image URL must be a valid http(s) URL', 400);
  if (typeof isActive !== 'boolean') return fail('Invalid status', 400);

  try {
    const rows = await query<{ category_id: number }>(
      `INSERT INTO categories (name, slug, parent_id, description, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING category_id::int AS category_id`,
      [name, slug, parentId, optStr(body.description), imageUrl, isActive]
    );
    return NextResponse.json({ success: true, category: rows[0] }, { status: 201 });
  } catch (error) {
    const code = pgCode(error);
    if (code === '23505') return fail('A category with this slug already exists', 409);
    if (code === '23503') return fail('Parent category does not exist', 400);
    console.error('Admin category create error:', error);
    return fail('Failed to create category', 500);
  }
}