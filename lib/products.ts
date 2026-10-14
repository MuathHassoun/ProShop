// lib/products.ts
import 'server-only';
import { connection } from 'next/server';
import { query } from '@/lib/db';
import type { Product } from '@/types';

type ProductRow = {
  product_id: number;
  category_id: number;
  brand_id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string | number;
  discount_price: string | number | null;
  stock_quantity: number | null;
  is_active: boolean | null;
  created_at: string | Date | null;
  category_name: string;
  brand_name: string;
  image_url: string | null;
  rating: string | number;
  num_reviews: string | number;
};

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toISO(value: string | Date | null): string {
  if (!value) return '';
  return value instanceof Date ? value.toISOString() : String(value);
}

const PRODUCT_SELECT = `
  SELECT
    p.product_id,
    p.category_id,
    p.brand_id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.discount_price,
    p.stock_quantity,
    p.is_active,
    p.created_at,
    c.name AS category_name,
    b.name AS brand_name,
    img.image_url,
    COALESCE(rv.rating, 0) AS rating,
    COALESCE(rv.num_reviews, 0) AS num_reviews
  FROM products p
  JOIN categories c ON c.category_id = p.category_id
  JOIN brands b ON b.brand_id = p.brand_id
  LEFT JOIN LATERAL (
    SELECT pi.image_url
    FROM product_images pi
    WHERE pi.product_id = p.product_id
    ORDER BY pi.is_main DESC, pi.image_id ASC
    LIMIT 1
  ) img ON TRUE
  LEFT JOIN LATERAL (
    SELECT ROUND(AVG(r.rating)::numeric, 1) AS rating, COUNT(*) AS num_reviews
    FROM reviews r
    WHERE r.product_id = p.product_id
  ) rv ON TRUE
  WHERE p.is_active = TRUE
`;

function mapProduct(row: ProductRow): Product {
  const price = toNumber(row.price) ?? 0;
  const discount = toNumber(row.discount_price);

  return {
    product_id: row.product_id,
    category_id: row.category_id,
    brand_id: row.brand_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price,
    discount_price: discount !== null && discount < price ? discount : null,
    stock_quantity: row.stock_quantity ?? 0,
    is_active: row.is_active ?? true,
    created_at: toISO(row.created_at),
    category_name: row.category_name,
    brand_name: row.brand_name,
    image_url: row.image_url ?? undefined,
    rating: toNumber(row.rating) ?? 0,
    num_reviews: toNumber(row.num_reviews) ?? 0,
  };
}

export async function getFeaturedProduct(): Promise<Product | null> {
  await connection();

  const rows = await query<ProductRow>(
    `${PRODUCT_SELECT}
       AND p.stock_quantity > 0
     ORDER BY
       (p.discount_price IS NOT NULL AND p.discount_price < p.price) DESC,
       p.created_at DESC NULLS LAST
     LIMIT 1`
  );

  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function getProducts(limit = 10): Promise<Product[]> {
  await connection();
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.trunc(limit)) : 10;

  const rows = await query<ProductRow>(
    `${PRODUCT_SELECT}
     ORDER BY (p.stock_quantity > 0) DESC, p.created_at DESC NULLS LAST
     LIMIT ${safeLimit}`
  );

  return rows.map(mapProduct);
}

export async function getTopRatedProducts(limit = 10): Promise<Product[]> {
  await connection();

  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.trunc(limit)) : 10;

  const rows = await query<ProductRow>(
    `${PRODUCT_SELECT}
       AND rv.num_reviews > 0
     ORDER BY rv.rating DESC, rv.num_reviews DESC, p.created_at DESC NULLS LAST
     LIMIT ${safeLimit}`
  );

  return rows.map(mapProduct);
}