// app/admin/users/new/page.tsx
import { Suspense } from 'react';
import AdminLoading from '@/components/admin/AdminLoading';
import UserForm from '@/components/admin/UserForm';
import { requireAdminPage } from '@/lib/admin-auth';

async function Content() {
  await requireAdminPage();
  return (
    <section className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-lg font-bold text-[#252525]">New user</h2>
      <UserForm
        mode="create"
        initial={{ full_name: '', email: '', phone: '', role: 'customer', is_active: true, password: '' }}
      />
    </section>
  );
}

export default function NewUserPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Content />
    </Suspense>
  );
}