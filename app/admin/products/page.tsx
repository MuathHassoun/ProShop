// app/admin/products/page.tsx
import Link from 'next/link';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import AdminPager from '@/components/admin/AdminPager';
import VariantRow from '@/components/admin/VariantRow';
import AdminLoading from '@/components/admin/AdminLoading';
import { primaryButtonClass } from '@/components/admin/fields';
import { requireAdminPage } from '@/lib/admin-auth';
import { ADMIN_PAGE_SIZE, listVariants, parseListParams } from '@/lib/admin-data';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

async function ProductsContent({ searchParams }: PageProps) {
  await requireAdminPage();
  const { q, page, offset } = parseListParams(await searchParams);
  const { rows, total } = await listVariants(q, offset);

  return (
    <section aria-labelledby="products-heading" className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="products-heading" className="text-lg font-bold text-[#252525]">
            Products
          </h2>
          <p className="mt-1 text-sm text-[#777777]">Edit price, discount and stock per variant. Click a name to edit the product.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action="/admin/products" role="search" className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search name or SKU"
              aria-label="Search products"
              className="w-48 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm focus:border-[#252525] focus:bg-white focus:outline-none"
            />
            <button type="submit" className="cursor-pointer rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-semibold hover:bg-[#f5f5f5]">
              Search
            </button>
          </form>
          <Link href="/admin/products/new" className={`${primaryButtonClass} flex items-center gap-2`}>
            <Plus size={16} aria-hidden="true" /> New product
          </Link>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-[#999999]">
            <tr>
              <th className="px-3 py-2 font-semibold">Product</th>
              <th className="px-3 py-2 font-semibold">Price</th>
              <th className="px-3 py-2 font-semibold">Discount</th>
              <th className="px-3 py-2 font-semibold">Stock</th>
              <th className="px-3 py-2 font-semibold">Variant on</th>
              <th className="px-3 py-2 font-semibold">In store</th>
              <th className="px-3 py-2 font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-[#777777]">
                  No products found.
                </td>
              </tr>
            ) : (
              rows.map((item) => <VariantRow key={item.variant_id} item={item} />)
            )}
          </tbody>
        </table>
      </div>

      <AdminPager basePath="/admin/products" params={{ q }} page={page} total={total} pageSize={ADMIN_PAGE_SIZE} />
    </section>
  );
}

export default function AdminProductsPage(props: PageProps) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <ProductsContent {...props} />
    </Suspense>
  );
}