// app/admin/users/[id]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AdminLoading from '@/components/admin/AdminLoading';
import DeleteButton from '@/components/admin/DeleteButton';
import UserForm from '@/components/admin/UserForm';
import { requireAdminPage } from '@/lib/admin-auth';
import { getUserAdmin } from '@/lib/admin-data';

type PageProps = { params: Promise<{ id: string }> };

async function Content({ params }: PageProps) {
  const admin = await requireAdminPage();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const user = await getUserAdmin(id);
  if (!user) notFound();
  const isSelf = user.user_id === admin.user_id;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-5 text-lg font-bold text-[#252525]">Edit user</h2>
        <UserForm
          mode="edit"
          userId={user.user_id}
          isSelf={isSelf}
          initial={{
            full_name: user.full_name,
            email: user.email,
            phone: user.phone ?? '',
            role: user.role,
            is_active: user.is_active,
            password: '',
          }}
        />
      </section>

      <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-[#252525]">Delete user</h2>
        <p className="mb-4 mt-1 text-sm text-[#777777]">
          Deletes the account with its addresses, cart, wishlist and reviews. Users who have placed orders can’t be
          deleted; deactivate them instead.
        </p>
        <DeleteButton
          url={`/api/admin/users/${user.user_id}`}
          label="Delete user"
          confirmText={`Delete the account of ${user.full_name} (${user.email})? This cannot be undone.`}
          redirectTo="/admin/users"
          disabled={isSelf}
          disabledReason="You cannot delete your own account."
        />
      </section>
    </div>
  );
}

export default function EditUserPage(props: PageProps) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Content {...props} />
    </Suspense>
  );
}