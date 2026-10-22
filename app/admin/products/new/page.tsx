// app/admin/products/new/page.tsx
import { Suspense } from 'react';
import AdminLoading from '@/components/admin/AdminLoading';
import ProductForm, { emptyProduct } from '@/components/admin/ProductForm';
import { requireAdminPage } from '@/lib/admin-auth';
import { listBrandOptions, listCategoryOptions } from '@/lib/admin-data';

async function Content() {
  await requireAdminPage();
  const [categories, brands] = await Promise.all([listCategoryOptions(), listBrandOptions()]);

  return (
    <section className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-lg font-bold text-[#252525]">New product</h2>
      {categories.length === 0 ? (
        <p className="text-sm text-[#777777]">Create a category first, then come back to add products.</p>
      ) : (
        <ProductForm mode="create" initial={emptyProduct} categories={categories} brands={brands} />
      )}
    </section>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Content />
    </Suspense>
  );
}