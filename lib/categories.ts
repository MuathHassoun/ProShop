// lib/categories.ts
import 'server-only';
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

export async function getCategories(scope: Scope = 'all'): Promise<Category[]> {
  await connection();

  return query<Category>(
    `SELECT category_id, name, slug, image_url
     FROM categories
     ${WHERE[scope]}
     ORDER BY name`
  );
}