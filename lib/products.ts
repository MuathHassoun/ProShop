// lib/products.ts
import 'server-only';
import { cache } from 'react';
import { connection } from 'next/server';
import { query } from '@/lib/db';
import type { Product, ProductImage, ProductSpec, ProductVariant, Review } from '@/types';
import { PAGE_SIZE, type CatalogFilters, type SortKey } from '@/lib/catalog-params';

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
  variant_id: number | null;
  is_active: boolean | null;
  created_at: string | Date | null;
  category_name: string;
  brand_name: string;
  image_url: string | null;
  rating: string | number;
  num_reviews: string | number;
};

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toISO(value: string | Date | null): string {
  if (!value) return '';
  return value instanceof Date ? value.toISOString() : String(value);
}

function clampLimit(limit: number, fallback = 10): number {
  return Number.isFinite(limit) ? Math.max(1, Math.trunc(limit)) : fallback;
}

/**
 * Price, discount and stock now live on product_variants.
 * For listings we show the cheapest active variant ("from" price)
 * and the total stock across all active variants.
 * Alias: vr  ->  vr.price, vr.discount_price, vr.stock_quantity
 */
const VARIANT_LATERAL = `
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(SUM(x.stock_quantity), 0)::int AS stock_quantity,
      (ARRAY_AGG(x.variant_id ORDER BY x.eff ASC, x.variant_id ASC))[1] AS variant_id,
      (ARRAY_AGG(x.price ORDER BY x.eff ASC, x.variant_id ASC))[1] AS price,
      (ARRAY_AGG(x.discount_price ORDER BY x.eff ASC, x.variant_id ASC))[1] AS discount_price
    FROM (
      SELECT v.variant_id, v.price, v.discount_price, v.stock_quantity,
             CASE WHEN v.discount_price IS NOT NULL AND v.discount_price < v.price
                  THEN v.discount_price ELSE v.price END AS eff
      FROM product_variants v
      WHERE v.product_id = p.product_id AND v.is_active = TRUE
    ) x
  ) vr ON TRUE
`;

const PRODUCT_SELECT = `
  SELECT
    p.product_id,
    p.category_id,
    p.brand_id,
    p.name,
    p.slug,
    p.description,
    vr.price,
    vr.discount_price,
    vr.stock_quantity,
    vr.variant_id,
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
  ${VARIANT_LATERAL}
  WHERE p.is_active = TRUE
    AND vr.price IS NOT NULL
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
    variant_id: row.variant_id !== null && row.variant_id !== undefined ? Number(row.variant_id) : undefined,
    is_active: row.is_active ?? true,
    created_at: toISO(row.created_at),
    category_name: row.category_name,
    brand_name: row.brand_name,
    image_url: row.image_url ?? undefined,
    rating: toNumber(row.rating) ?? 0,
    num_reviews: toNumber(row.num_reviews) ?? 0,
  };
}

async function fetchProducts(filter: string, orderBy: string, limit: number): Promise<Product[]> {
  await connection();

  const rows = await query<ProductRow>(
    `${PRODUCT_SELECT}
       ${filter}
     ORDER BY ${orderBy}
     LIMIT ${clampLimit(limit)}`
  );

  return rows.map(mapProduct);
}

export const getProducts = cache((limit = 10) =>
  fetchProducts('', '(vr.stock_quantity > 0) DESC, p.created_at DESC NULLS LAST', limit)
);

export const getTopRatedProducts = cache((limit = 10) =>
  fetchProducts(
    'AND rv.num_reviews > 0',
    'rv.rating DESC, rv.num_reviews DESC, p.created_at DESC NULLS LAST',
    limit
  )
);

export const getDiscountedProducts = cache((limit = 5) =>
  fetchProducts(
    `AND vr.stock_quantity > 0
     AND vr.discount_price IS NOT NULL
     AND vr.discount_price < vr.price`,
    '(vr.price - vr.discount_price) DESC, p.created_at DESC NULLS LAST',
    limit
  )
);

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  await connection();

  const rows = await query<ProductRow>(`${PRODUCT_SELECT} AND p.slug = $1 LIMIT 1`, [slug]);
  return rows[0] ? mapProduct(rows[0]) : null;
});

async function safeQuery<T>(sqlText: string, params: (string | number)[]): Promise<T[]> {
  try {
    return await query<T>(sqlText, params);
  } catch {
    return [];
  }
}

export const getProductImages = cache(async (productId: number): Promise<ProductImage[]> => {
  await connection();

  const rows = await safeQuery<{ image_id: number; product_id: number; image_url: string; is_main: boolean }>(
    `SELECT image_id, product_id, image_url, is_main
     FROM product_images
     WHERE product_id = $1
     ORDER BY is_main DESC, display_order ASC, image_id ASC`,
    [productId]
  );

  return rows.map((r) => ({
    image_id: Number(r.image_id),
    product_id: Number(r.product_id),
    image_url: r.image_url,
    is_main: Boolean(r.is_main),
  }));
});

export const getProductSpecs = cache(async (productId: number): Promise<ProductSpec[]> => {
  await connection();

  const rows = await safeQuery<{ spec_key: string; spec_value: string }>(
    `SELECT
       a.name AS spec_key,
       COALESCE(
         v.value_text,
         CASE WHEN v.value_number IS NOT NULL
              THEN TRIM(v.value_number::text || ' ' || COALESCE(a.unit, '')) END,
         CASE WHEN v.value_boolean IS NOT NULL
              THEN CASE WHEN v.value_boolean THEN 'Yes' ELSE 'No' END END,
         v.value_date::text
       ) AS spec_value
     FROM product_attribute_values v
     JOIN attributes a ON a.attribute_id = v.attribute_id
     JOIN products p ON p.product_id = v.product_id
     LEFT JOIN category_attributes ca
       ON ca.attribute_id = a.attribute_id AND ca.category_id = p.category_id
     WHERE v.product_id = $1
     ORDER BY COALESCE(ca.display_order, 9999), a.name`,
    [productId]
  );

  return rows.map((r, i) => ({
    spec_id: i,
    product_id: productId,
    spec_key: r.spec_key,
    spec_value: r.spec_value ?? '',
  }));
});

export const getProductVariants = cache(async (productId: number): Promise<ProductVariant[]> => {
  await connection();

  const rows = await safeQuery<{
    variant_id: number;
    product_id: number;
    sku: string | null;
    variant_name: string | null;
    options: Record<string, unknown> | null;
    price: string | number;
    discount_price: string | number | null;
    currency: string;
    stock_quantity: number;
  }>(
    `SELECT variant_id, product_id, sku, variant_name, options,
            price, discount_price, currency, stock_quantity
     FROM product_variants
     WHERE product_id = $1 AND is_active = TRUE
     ORDER BY variant_id`,
    [productId]
  );

  return rows.map((r) => {
    const price = toNumber(r.price) ?? 0;
    const discount = toNumber(r.discount_price);

    return {
      variant_id: Number(r.variant_id),
      product_id: Number(r.product_id),
      sku: r.sku,
      variant_name: r.variant_name,
      options: Object.fromEntries(
        Object.entries(r.options ?? {}).map(([k, v]) => [k, String(v)])
      ),
      price,
      discount_price: discount !== null && discount < price ? discount : null,
      currency: r.currency,
      stock_quantity: Number(r.stock_quantity ?? 0),
    };
  });
});

export const getProductReviews = cache(async (productId: number): Promise<Review[]> => {
  await connection();

  const rows = await safeQuery<{
    review_id: number;
    product_id: number;
    user_id: number;
    rating: number;
    title: string | null;
    comment: string | null;
    created_at: string | Date;
    user_name: string | null;
  }>(
    `SELECT r.review_id, r.product_id, r.user_id, r.rating, r.title, r.comment,
            r.created_at, u.full_name AS user_name
     FROM reviews r
     JOIN users u ON u.user_id = r.user_id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC
     LIMIT 50`,
    [productId]
  );

  return rows.map((r) => ({
    review_id: Number(r.review_id),
    product_id: Number(r.product_id),
    user_id: Number(r.user_id),
    rating: Number(r.rating),
    title: r.title,
    comment: r.comment,
    created_at: toISO(r.created_at),
    user_name: r.user_name ?? 'Anonymous',
  }));
});

export const getRelatedProducts = cache(
  async (categoryId: number, excludeProductId: number, limit = 8): Promise<Product[]> => {
    await connection();

    const rows = await query<ProductRow>(
      `${PRODUCT_SELECT}
         AND p.category_id = $1
         AND p.product_id <> $2
       ORDER BY
         (vr.stock_quantity > 0) DESC,
         COALESCE(rv.rating, 0) DESC,
         COALESCE(rv.num_reviews, 0) DESC,
         p.created_at DESC NULLS LAST
       LIMIT ${clampLimit(limit)}`,
      [categoryId, excludeProductId]
    );

    return rows.map(mapProduct);
  }
);

const EFFECTIVE_PRICE = `(CASE WHEN vr.discount_price IS NOT NULL AND vr.discount_price < vr.price
                              THEN vr.discount_price ELSE vr.price END)`;

const TREE_CTE = `WITH RECURSIVE tree AS (
  SELECT category_id FROM categories WHERE category_id = $1
  UNION
  SELECT c.category_id FROM categories c JOIN tree t ON c.parent_id = t.category_id
)`;

const CATEGORY_ORDER: Record<SortKey, string> = {
  featured: '(COALESCE(vr.stock_quantity, 0) > 0) DESC, p.created_at DESC NULLS LAST, p.product_id DESC',
  newest: 'p.created_at DESC NULLS LAST, p.product_id DESC',
  'price-asc': `${EFFECTIVE_PRICE} ASC, p.product_id ASC`,
  'price-desc': `${EFFECTIVE_PRICE} DESC, p.product_id ASC`,
  'top-rated': 'COALESCE(rv.rating, 0) DESC, COALESCE(rv.num_reviews, 0) DESC, p.product_id ASC',
};

type SqlParam = string | number | boolean | null;

function buildWhere(f: CatalogFilters, params: SqlParam[], conditions: string[]) {
  const push = (value: string | number) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (f.brands.length) {
    conditions.push(`p.brand_id IN (${f.brands.map((id) => push(id)).join(', ')})`);
  }
  if (f.minPrice !== null) conditions.push(`${EFFECTIVE_PRICE} >= ${push(f.minPrice)}`);
  if (f.maxPrice !== null) conditions.push(`${EFFECTIVE_PRICE} <= ${push(f.maxPrice)}`);
  if (f.inStock) conditions.push('vr.stock_quantity > 0');
  if (f.onSale) conditions.push('(vr.discount_price IS NOT NULL AND vr.discount_price < vr.price)');

  return { params, where: conditions.map((c) => `AND ${c}`).join('\n') };
}

function buildCategoryWhere(categoryId: number, f: CatalogFilters) {
  return buildWhere(f, [categoryId], ['p.category_id IN (SELECT category_id FROM tree)']);
}

export async function getCategoryProducts(
  categoryId: number,
  f: CatalogFilters
): Promise<{ products: Product[]; total: number }> {
  await connection();

  const { params, where } = buildCategoryWhere(categoryId, f);
  const offset = (f.page - 1) * PAGE_SIZE;

  const [rows, counts] = await Promise.all([
    query<ProductRow>(
      `${TREE_CTE}
       ${PRODUCT_SELECT}
         ${where}
       ORDER BY ${CATEGORY_ORDER[f.sort]}
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
      params
    ),
    query<{ count: string | number }>(
      `${TREE_CTE}
       SELECT COUNT(*) AS count
       FROM products p
       ${VARIANT_LATERAL}
       WHERE p.is_active = TRUE
         AND vr.price IS NOT NULL
         ${where}`,
      params
    ),
  ]);

  return { products: rows.map(mapProduct), total: Number(counts[0]?.count ?? 0) };
}

export type CategoryFacets = {
  brands: { brand_id: number; name: string; count: number }[];
  total: number;
  minPrice: number | null;
  maxPrice: number | null;
};

export const getCategoryFacets = cache(async (categoryId: number): Promise<CategoryFacets> => {
  await connection();

  const [brandRows, boundRows] = await Promise.all([
    query<{ brand_id: number; name: string; count: string | number }>(
      `${TREE_CTE}
       SELECT b.brand_id, b.name, COUNT(*) AS count
       FROM products p
       JOIN brands b ON b.brand_id = p.brand_id
       ${VARIANT_LATERAL}
       WHERE p.is_active = TRUE
         AND vr.price IS NOT NULL
         AND p.category_id IN (SELECT category_id FROM tree)
       GROUP BY b.brand_id, b.name
       ORDER BY b.name`,
      [categoryId]
    ),
    query<{ min_price: string | number | null; max_price: string | number | null }>(
      `${TREE_CTE}
       SELECT MIN(${EFFECTIVE_PRICE}) AS min_price, MAX(${EFFECTIVE_PRICE}) AS max_price
       FROM products p
       ${VARIANT_LATERAL}
       WHERE p.is_active = TRUE
         AND vr.price IS NOT NULL
         AND p.category_id IN (SELECT category_id FROM tree)`,
      [categoryId]
    ),
  ]);

  const brands = brandRows.map((r) => ({
    brand_id: Number(r.brand_id),
    name: r.name,
    count: Number(r.count),
  }));

  return {
    brands,
    total: brands.reduce((sum, b) => sum + b.count, 0),
    minPrice: toNumber(boundRows[0]?.min_price),
    maxPrice: toNumber(boundRows[0]?.max_price),
  };
});

/* ---------- All products (/products) ---------- */

export async function getAllProducts(
  f: CatalogFilters
): Promise<{ products: Product[]; total: number }> {
  await connection();

  const { params, where } = buildWhere(f, [], []);
  const offset = (f.page - 1) * PAGE_SIZE;

  const [rows, counts] = await Promise.all([
    query<ProductRow>(
      `${PRODUCT_SELECT}
         ${where}
       ORDER BY ${CATEGORY_ORDER[f.sort]}
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
      params
    ),
    query<{ count: string | number }>(
      `SELECT COUNT(*) AS count
       FROM products p
       ${VARIANT_LATERAL}
       WHERE p.is_active = TRUE
         AND vr.price IS NOT NULL
         ${where}`,
      params
    ),
  ]);

  return { products: rows.map(mapProduct), total: Number(counts[0]?.count ?? 0) };
}

export const getAllFacets = cache(async (): Promise<CategoryFacets> => {
  await connection();

  const [brandRows, boundRows] = await Promise.all([
    query<{ brand_id: number; name: string; count: string | number }>(
      `SELECT b.brand_id, b.name, COUNT(*) AS count
       FROM products p
       JOIN brands b ON b.brand_id = p.brand_id
       ${VARIANT_LATERAL}
       WHERE p.is_active = TRUE
         AND vr.price IS NOT NULL
       GROUP BY b.brand_id, b.name
       ORDER BY b.name`
    ),
    query<{ min_price: string | number | null; max_price: string | number | null }>(
      `SELECT MIN(${EFFECTIVE_PRICE}) AS min_price, MAX(${EFFECTIVE_PRICE}) AS max_price
       FROM products p
       ${VARIANT_LATERAL}
       WHERE p.is_active = TRUE
         AND vr.price IS NOT NULL`
    ),
  ]);

  const brands = brandRows.map((r) => ({
    brand_id: Number(r.brand_id),
    name: r.name,
    count: Number(r.count),
  }));

  return {
    brands,
    total: brands.reduce((sum, b) => sum + b.count, 0),
    minPrice: toNumber(boundRows[0]?.min_price),
    maxPrice: toNumber(boundRows[0]?.max_price),
  };
});
