// lib/categories.ts
import 'server-only';
import { cache } from 'react';
import { connection } from 'next/server';
import { query } from '@/lib/db';

export type Category = {
  category_id: number;
  name: string;
  slug: string;
  image_url: string | null;
};

type Scope = 'all' | 'top' | 'leaf';

const WHERE: Record<Scope, string> = {
  all: '',
  top: 'WHERE parent_id IS NULL',
  leaf: `WHERE NOT EXISTS (
           SELECT 1 FROM categories c WHERE c.parent_id = categories.category_id
         )`,
};

export async function getCategories(scope: Scope = 'all', limit?: number): Promise<Category[]> {
  await connection();

  const limitClause =
    limit !== undefined && Number.isFinite(limit) ? `LIMIT ${Math.max(1, Math.trunc(limit))}` : '';

  return query<Category>(
    `SELECT category_id, name, slug, image_url
     FROM categories
     ${WHERE[scope]}
     ORDER BY name
     ${limitClause}`
  );
}
export type CategoryDetail = Category & {
  parent_id: number | null;
  description: string | null;
};

export const getCategoryBySlug = cache(async (slug: string): Promise<CategoryDetail | null> => {
  await connection();

  const rows = await query<CategoryDetail>(
    `SELECT category_id, parent_id, name, slug, description, image_url
     FROM categories
     WHERE slug = $1 AND is_active = TRUE
     LIMIT 1`,
    [slug]
  );
  return rows[0] ?? null;
});

export const getSubcategories = cache(async (parentId: number): Promise<Category[]> => {
  await connection();

  return query<Category>(
    `SELECT category_id, name, slug, image_url
     FROM categories
     WHERE parent_id = $1 AND is_active = TRUE
     ORDER BY name`,
    [parentId]
  );
});

export const getCategoryTrail = cache(
  async (categoryId: number): Promise<{ name: string; slug: string }[]> => {
    await connection();

    return query<{ name: string; slug: string }>(
      `WITH RECURSIVE ancestors AS (
         SELECT category_id, parent_id, name, slug, 0 AS depth
         FROM categories
         WHERE category_id = $1
         UNION ALL
         SELECT c.category_id, c.parent_id, c.name, c.slug, a.depth + 1
         FROM categories c
         JOIN ancestors a ON c.category_id = a.parent_id
         WHERE a.depth < 10
       )
       SELECT name, slug FROM ancestors WHERE depth > 0 ORDER BY depth DESC`,
      [categoryId]
    );
  }
);

export type CategoryNode = Category & { children: Category[] };

/** Active categories grouped as top-level categories with their direct children. */
export const getCategoryTree = cache(async (): Promise<CategoryNode[]> => {
  await connection();

  const rows = await query<Category & { parent_id: number | null }>(
    `SELECT category_id, parent_id, name, slug, image_url
     FROM categories
     WHERE is_active = TRUE
     ORDER BY name`
  );

  const byParent = new Map<number, Category[]>();
  for (const r of rows) {
    if (r.parent_id === null) continue;
    const list = byParent.get(Number(r.parent_id)) ?? [];
    list.push({ category_id: r.category_id, name: r.name, slug: r.slug, image_url: r.image_url });
    byParent.set(Number(r.parent_id), list);
  }

  return rows
    .filter((r) => r.parent_id === null)
    .map((r) => ({
      category_id: r.category_id,
      name: r.name,
      slug: r.slug,
      image_url: r.image_url,
      children: byParent.get(Number(r.category_id)) ?? [],
    }));
});
