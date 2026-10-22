// app/admin/users/page.tsx
import Link from 'next/link';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import AdminPager from '@/components/admin/AdminPager';
import UserControls from '@/components/admin/UserControls';
import AdminLoading from '@/components/admin/AdminLoading';
import { primaryButtonClass } from '@/components/admin/fields';
import { requireAdminPage } from '@/lib/admin-auth';
import { ADMIN_PAGE_SIZE, listUsers, parseListParams } from '@/lib/admin-data';
import { formatDate } from '@/lib/format';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

async function UsersContent({ searchParams }: PageProps) {
  const admin = await requireAdminPage();
  const { q, page, offset } = parseListParams(await searchParams);
  const { rows, total } = await listUsers(q, offset);

  return (
    <section aria-labelledby="users-heading" className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="users-heading" className="text-lg font-bold text-[#252525]">
            Users
          </h2>
          <p className="mt-1 text-sm text-[#777777]">Change roles or deactivate accounts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action="/admin/users" role="search" className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search name or email"
              aria-label="Search users"
              className="w-48 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm focus:border-[#252525] focus:bg-white focus:outline-none"
            />
            <button type="submit" className="cursor-pointer rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-semibold hover:bg-[#f5f5f5]">
              Search
            </button>
          </form>
          <Link href="/admin/users/new" className={`${primaryButtonClass} flex items-center gap-2`}>
            <Plus size={16} aria-hidden="true" /> New user
          </Link>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-[#999999]">
            <tr>
              <th className="px-3 py-2 font-semibold">User</th>
              <th className="px-3 py-2 font-semibold">Joined</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Manage</th>
              <th className="px-3 py-2"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-[#777777]">
                  No users found.
                </td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr key={u.user_id} className="border-t border-[#eeeeee] align-top">
                  <td className="px-3 py-3">
                    <p className="font-medium">{u.full_name}</p>
                    <p className="text-xs text-[#777777]">{u.email}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-[#777777]">{formatDate(u.created_at)}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <UserControls
                      userId={u.user_id}
                      role={u.role}
                      isActive={u.is_active}
                      isSelf={u.user_id === admin.user_id}
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Link
                      href={`/admin/users/${u.user_id}`}
                      className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-sm font-semibold hover:bg-[#f5f5f5]"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminPager basePath="/admin/users" params={{ q }} page={page} total={total} pageSize={ADMIN_PAGE_SIZE} />
    </section>
  );
}

export default function AdminUsersPage(props: PageProps) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <UsersContent {...props} />
    </Suspense>
  );
}