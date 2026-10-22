// app/admin/categories/page.tsx
import Link from 'next/link';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import AdminLoading from '@/components/admin/AdminLoading';
import AdminPager from '@/components/admin/AdminPager';
import { primaryButtonClass } from '@/components/admin/fields';
import { requireAdminPage } from '@/lib/admin-auth';
import { ADMIN_PAGE_SIZE, listCategoriesAdmin, parseListParams } from '@/lib/admin-data';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

async function CategoriesContent({ searchParams }: PageProps) {
  await requireAdminPage();
  const { q, page, offset } = parseListParams(await searchParams);
  const { rows, total } = await listCategoriesAdmin(q, offset);

  return (
    <section aria-labelledby="categories-heading" className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="categories-heading" className="text-lg font-bold text-[#252525]">Categories</h2>
          <p className="mt-1 text-sm text-[#777777]">Organise products into categories and subcategories.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action="/admin/categories" role="search" className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search categories"
              aria-label="Search categories"
              className="w-48 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm focus:border-[#252525] focus:bg-white focus:outline-none"
            />
            <button type="submit" className="cursor-pointer rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-semibold hover:bg-[#f5f5f5]">
              Search
            </button>
          </form>
          <Link href="/admin/categories/new" className={`${primaryButtonClass} flex items-center gap-2`}>
            <Plus size={16} aria-hidden="true" /> New category
          </Link>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-[#999999]">
            <tr>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Slug</th>
              <th className="px-3 py-2 font-semibold">Parent</th>
              <th className="px-3 py-2 font-semibold">Products</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-[#777777]">No categories found.</td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.category_id} className="border-t border-[#eeeeee]">
                  <td className="px-3 py-3 font-semibold">{c.name}</td>
                  <td className="px-3 py-3 text-[#777777]">{c.slug}</td>
                  <td className="px-3 py-3 text-[#777777]">{c.parent_name ?? '—'}</td>
                  <td className="px-3 py-3">{c.product_count}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {c.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Link href={`/admin/categories/${c.category_id}`} className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-sm font-semibold hover:bg-[#f5f5f5]">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminPager basePath="/admin/categories" params={{ q }} page={page} total={total} pageSize={ADMIN_PAGE_SIZE} />
    </section>
  );
}

export default function AdminCategoriesPage(props: PageProps) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <CategoriesContent {...props} />
    </Suspense>
  );
}