// app/admin/categories/[id]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AdminLoading from '@/components/admin/AdminLoading';
import CategoryForm from '@/components/admin/CategoryForm';
import DeleteButton from '@/components/admin/DeleteButton';
import { requireAdminPage } from '@/lib/admin-auth';
import { getCategoryAdmin, listCategoryOptions } from '@/lib/admin-data';

type PageProps = { params: Promise<{ id: string }> };

async function Content({ params }: PageProps) {
  await requireAdminPage();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [category, options] = await Promise.all([getCategoryAdmin(id), listCategoryOptions()]);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-5 text-lg font-bold text-[#252525]">Edit category</h2>
        <CategoryForm
          mode="edit"
          categoryId={category.category_id}
          parents={options.filter((o) => o.category_id !== category.category_id)}
          initial={{
            name: category.name,
            slug: category.slug,
            parent_id: category.parent_id,
            description: category.description ?? '',
            image_url: category.image_url ?? '',
            is_active: category.is_active,
          }}
        />
      </section>

      <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-[#252525]">Delete category</h2>
        <p className="mb-4 mt-1 text-sm text-[#777777]">
          A category can only be deleted when it has no products and no subcategories.
        </p>
        <DeleteButton
          url={`/api/admin/categories/${category.category_id}`}
          label="Delete category"
          confirmText={`Delete the category "${category.name}"? This cannot be undone.`}
          redirectTo="/admin/categories"
        />
      </section>
    </div>
  );
}

export default function EditCategoryPage(props: PageProps) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Content {...props} />
    </Suspense>
  );
}