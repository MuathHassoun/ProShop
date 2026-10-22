// app/admin/products/[id]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AdminLoading from '@/components/admin/AdminLoading';
import DeleteButton from '@/components/admin/DeleteButton';
import ProductForm, { emptyProduct } from '@/components/admin/ProductForm';
import { requireAdminPage } from '@/lib/admin-auth';
import { getProductAdmin, listBrandOptions, listCategoryOptions } from '@/lib/admin-data';

type PageProps = { params: Promise<{ id: string }> };

async function Content({ params }: PageProps) {
  await requireAdminPage();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [product, categories, brands] = await Promise.all([
    getProductAdmin(id),
    listCategoryOptions(),
    listBrandOptions(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-[#252525]">Edit product</h2>
        <p className="mb-5 text-sm text-[#777777]">
          {product.variant_count} variant{product.variant_count === 1 ? '' : 's'}. Edit price, discount and stock from
          the products list.
        </p>
        <ProductForm
          mode="edit"
          productId={product.product_id}
          categories={categories}
          brands={brands}
          initial={{
            ...emptyProduct,
            name: product.name,
            slug: product.slug,
            category_id: product.category_id,
            brand_id: product.brand_id,
            model_number: product.model_number ?? '',
            description: product.description ?? '',
            image_url: product.image_url ?? '',
            is_active: product.is_active,
          }}
        />
      </section>

      <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-[#252525]">Delete product</h2>
        <p className="mb-4 mt-1 text-sm text-[#777777]">
          Deletes the product with its variants, images, reviews and wishlist entries. Past orders keep their
          snapshots. A product that is in someone’s cart can’t be deleted; hide it instead.
        </p>
        <DeleteButton
          url={`/api/admin/products/${product.product_id}`}
          label="Delete product"
          confirmText={`Delete the product "${product.name}"? This cannot be undone.`}
          redirectTo="/admin/products"
        />
      </section>
    </div>
  );
}

export default function EditProductPage(props: PageProps) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Content {...props} />
    </Suspense>
  );
}