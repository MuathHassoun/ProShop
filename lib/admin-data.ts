// lib/admin-data.ts
import 'server-only';
import { query } from '@/lib/db';

export const ADMIN_PAGE_SIZE = 25;
export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded', 'failed'] as const;

type RawParams = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseListParams(raw: RawParams) {
  const q = (first(raw.q) ?? '').trim().slice(0, 100);
  const status = (first(raw.status) ?? '').trim();
  const pageNum = Math.trunc(Number(first(raw.page)));
  const page = Number.isFinite(pageNum) ? Math.min(Math.max(pageNum, 1), 10000) : 1;
  return { q, status, page, offset: (page - 1) * ADMIN_PAGE_SIZE };
}

/* ---------------- Dashboard ---------------- */
export interface DashboardStats {
  users: number;
  orders: number;
  pendingOrders: number;
  revenue: number;
  activeProducts: number;
  lowStock: number;
}

export interface RecentOrder {
  order_id: number;
  full_name: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
}

export interface LowStockItem {
  variant_id: number;
  product_name: string;
  variant_name: string | null;
  stock_quantity: number;
}

export const LOW_STOCK_THRESHOLD = 5;

export async function getDashboard() {
  const [stats, recent, low] = await Promise.all([
    query<Record<string, string | number | null>>(
      `SELECT
         (SELECT COUNT(*) FROM users)::int AS users,
         (SELECT COUNT(*) FROM orders)::int AS orders,
         (SELECT COUNT(*) FROM orders WHERE status = 'pending')::int AS pending_orders,
         (SELECT COALESCE(SUM(total_amount), 0) FROM orders
            WHERE payment_status = 'paid' AND status <> 'cancelled') AS revenue,
         (SELECT COUNT(*) FROM products WHERE is_active)::int AS active_products,
         (SELECT COUNT(*) FROM product_variants
            WHERE is_active AND stock_quantity <= $1)::int AS low_stock`,
      [LOW_STOCK_THRESHOLD]
    ),
    query<RecentOrder & { total_amount: string }>(
      `SELECT o.order_id::int AS order_id, u.full_name, o.status, o.payment_status,
              o.total_amount, o.created_at
       FROM orders o JOIN users u ON u.user_id = o.user_id
       ORDER BY o.created_at DESC, o.order_id DESC
       LIMIT 5`
    ),
    query<LowStockItem>(
      `SELECT v.variant_id::int AS variant_id, p.name AS product_name, v.variant_name,
              v.stock_quantity
       FROM product_variants v JOIN products p ON p.product_id = v.product_id
       WHERE v.is_active AND p.is_active AND v.stock_quantity <= $1
       ORDER BY v.stock_quantity ASC, p.name
       LIMIT 8`,
      [LOW_STOCK_THRESHOLD]
    ),
  ]);

  const s = stats[0] ?? {};
  const result: DashboardStats = {
    users: Number(s.users ?? 0),
    orders: Number(s.orders ?? 0),
    pendingOrders: Number(s.pending_orders ?? 0),
    revenue: Number(s.revenue ?? 0),
    activeProducts: Number(s.active_products ?? 0),
    lowStock: Number(s.low_stock ?? 0),
  };

  return {
    stats: result,
    recentOrders: recent.map((r) => ({
      ...r,
      total_amount: Number(r.total_amount),
      created_at: new Date(r.created_at).toISOString(),
    })) as RecentOrder[],
    lowStock: low,
  };
}

/* ---------------- Orders ---------------- */
export interface AdminOrder {
  order_id: number;
  full_name: string;
  email: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
}

export async function listOrders(status: string, offset: number) {
  const filter = (ORDER_STATUSES as readonly string[]).includes(status) ? status : '';
  const rows = await query<AdminOrder & { total_amount: string; total: number }>(
    `SELECT o.order_id::int AS order_id, u.full_name, u.email, o.status, o.payment_status,
            o.total_amount, o.created_at, COUNT(*) OVER()::int AS total
     FROM orders o JOIN users u ON u.user_id = o.user_id
     WHERE ($1::text = '' OR o.status = $1::text)
     ORDER BY o.created_at DESC, o.order_id DESC
     LIMIT ${ADMIN_PAGE_SIZE} OFFSET $2`,
    [filter, offset]
  );
  return {
    total: rows[0]?.total ?? 0,
    rows: rows.map((r) => ({
      ...r,
      total_amount: Number(r.total_amount),
      created_at: new Date(r.created_at).toISOString(),
    })) as AdminOrder[],
  };
}

/* ---------------- Products (one row per variant) ---------------- */
export interface AdminVariant {
  variant_id: number;
  product_id: number;
  product_name: string;
  variant_name: string | null;
  sku: string | null;
  category_name: string;
  product_active: boolean;
  variant_active: boolean;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
}

export async function listVariants(q: string, offset: number) {
  const rows = await query<
    Omit<AdminVariant, 'price' | 'discount_price'> & {
      price: string;
      discount_price: string | null;
      total: number;
    }
  >(
    `SELECT v.variant_id::int AS variant_id, p.product_id::int AS product_id,
            p.name AS product_name, v.variant_name, v.sku, c.name AS category_name,
            p.is_active AS product_active, v.is_active AS variant_active,
            v.price, v.discount_price, v.stock_quantity,
            COUNT(*) OVER()::int AS total
     FROM product_variants v
     JOIN products p ON p.product_id = v.product_id
     JOIN categories c ON c.category_id = p.category_id
     WHERE ($1::text = '' OR p.name ILIKE '%' || $1::text || '%' OR v.sku ILIKE '%' || $1::text || '%')
     ORDER BY p.name, v.variant_id
     LIMIT ${ADMIN_PAGE_SIZE} OFFSET $2`,
    [q, offset]
  );
  return {
    total: rows[0]?.total ?? 0,
    rows: rows.map((r) => ({
      ...r,
      price: Number(r.price),
      discount_price: r.discount_price === null ? null : Number(r.discount_price),
    })) as AdminVariant[],
  };
}


/* ---------------- Categories ---------------- */
export interface AdminCategoryRow {
  category_id: number;
  name: string;
  slug: string;
  parent_name: string | null;
  is_active: boolean;
  product_count: number;
}

export async function listCategoriesAdmin(q: string, offset: number) {
  const rows = await query<AdminCategoryRow & { total: number }>(
    `SELECT c.category_id::int AS category_id, c.name, c.slug, p.name AS parent_name, c.is_active,
            (SELECT COUNT(*) FROM products pr WHERE pr.category_id = c.category_id)::int AS product_count,
            COUNT(*) OVER()::int AS total
     FROM categories c
     LEFT JOIN categories p ON p.category_id = c.parent_id
     WHERE ($1::text = '' OR c.name ILIKE '%' || $1::text || '%' OR c.slug ILIKE '%' || $1::text || '%')
     ORDER BY c.name, c.category_id
     LIMIT ${ADMIN_PAGE_SIZE} OFFSET $2`,
    [q, offset]
  );
  return { total: rows[0]?.total ?? 0, rows: rows as AdminCategoryRow[] };
}

export interface AdminCategory {
  category_id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
}

export async function getCategoryAdmin(id: number): Promise<AdminCategory | null> {
  const rows = await query<AdminCategory>(
    `SELECT category_id::int AS category_id, parent_id::int AS parent_id, name, slug,
            description, image_url, is_active
     FROM categories WHERE category_id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function listCategoryOptions() {
  return query<{ category_id: number; name: string }>(
    `SELECT category_id::int AS category_id, name FROM categories ORDER BY name`
  );
}

export async function listBrandOptions() {
  return query<{ brand_id: number; name: string }>(
    `SELECT brand_id::int AS brand_id, name FROM brands ORDER BY name`
  );
}

/* ---------------- Single user / product ---------------- */
export interface AdminUserDetail {
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'customer';
  is_active: boolean;
}

export async function getUserAdmin(id: number): Promise<AdminUserDetail | null> {
  const rows = await query<AdminUserDetail>(
    `SELECT user_id::int AS user_id, full_name, email, phone, role, is_active
     FROM users WHERE user_id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export interface AdminProductDetail {
  product_id: number;
  category_id: number;
  brand_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  model_number: string | null;
  is_active: boolean;
  image_url: string | null;
  variant_count: number;
}

export async function getProductAdmin(id: number): Promise<AdminProductDetail | null> {
  const rows = await query<AdminProductDetail>(
    `SELECT p.product_id::int AS product_id, p.category_id::int AS category_id,
            p.brand_id::int AS brand_id, p.name, p.slug, p.description, p.model_number, p.is_active,
            (SELECT image_url FROM product_images i
               WHERE i.product_id = p.product_id
               ORDER BY i.is_main DESC, i.display_order, i.image_id LIMIT 1) AS image_url,
            (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.product_id)::int AS variant_count
     FROM products p WHERE p.product_id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

/* ---------------- Users ---------------- */
export interface AdminListUser {
  user_id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'customer';
  is_active: boolean;
  created_at: string;
}

export async function listUsers(q: string, offset: number) {
  const rows = await query<AdminListUser & { total: number }>(
    `SELECT user_id::int AS user_id, full_name, email, role, is_active, created_at,
            COUNT(*) OVER()::int AS total
     FROM users
     WHERE ($1::text = '' OR full_name ILIKE '%' || $1::text || '%' OR email ILIKE '%' || $1::text || '%')
     ORDER BY created_at DESC, user_id DESC
     LIMIT ${ADMIN_PAGE_SIZE} OFFSET $2`,
    [q, offset]
  );
  return {
    total: rows[0]?.total ?? 0,
    rows: rows.map((r) => ({
      ...r,
      created_at: new Date(r.created_at).toISOString(),
    })) as AdminListUser[],
  };
}
