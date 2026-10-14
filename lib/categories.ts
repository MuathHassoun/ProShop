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

export async function getCategories(): Promise<Category[]> {
  await connection();

  return query<Category>(
    `SELECT category_id, name, slug, image_url
     FROM categories
     WHERE parent_id IS NULL
     ORDER BY name`
  );
}