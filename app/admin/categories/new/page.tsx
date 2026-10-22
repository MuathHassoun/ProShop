// app/admin/categories/new/page.tsx
import { Suspense } from 'react';
import AdminLoading from '@/components/admin/AdminLoading';
import CategoryForm from '@/components/admin/CategoryForm';
import { requireAdminPage } from '@/lib/admin-auth';
import { listCategoryOptions } from '@/lib/admin-data';

async function Content() {
  await requireAdminPage();
  const parents = await listCategoryOptions();

  return (
    <section className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-lg font-bold text-[#252525]">New category</h2>
      <CategoryForm
        mode="create"
        parents={parents}
        initial={{ name: '', slug: '', parent_id: null, description: '', image_url: '', is_active: true }}
      />
    </section>
  );
}

export default function NewCategoryPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Content />
    </Suspense>
  );
}