// components/admin/ProductForm.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckboxField, Field, FormError, inputClass, primaryButtonClass, secondaryButtonClass, slugify } from './fields';
import { sendJson } from './patch';

export interface ProductFormValues {
  name: string;
  slug: string;
  category_id: number | null;
  brand_id: number | null;
  model_number: string;
  description: string;
  image_url: string;
  is_active: boolean;
  // Only used when creating: the first (default) variant.
  sku: string;
  variant_name: string;
  price: string;
  discount_price: string;
  stock_quantity: string;
}

export const emptyProduct: ProductFormValues = {
  name: '',
  slug: '',
  category_id: null,
  brand_id: null,
  model_number: '',
  description: '',
  image_url: '',
  is_active: true,
  sku: '',
  variant_name: '',
  price: '',
  discount_price: '',
  stock_quantity: '0',
};

interface Props {
  mode: 'create' | 'edit';
  productId?: number;
  initial: ProductFormValues;
  categories: { category_id: number; name: string }[];
  brands: { brand_id: number; name: string }[];
}

export default function ProductForm({ mode, productId, initial, categories, brands }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({
    ...initial,
    category_id: initial.category_id ?? categories[0]?.category_id ?? null,
  });
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const url = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${productId}`;
    const { error: message } = await sendJson(mode === 'create' ? 'POST' : 'PATCH', url, { ...values });
    setSaving(false);
    if (message) return setError(message);
    router.push('/admin/products');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <FormError message={error} />

      <Field label="Name" htmlFor="prod-name">
        <input
          id="prod-name"
          required
          maxLength={250}
          value={values.name}
          onChange={(e) => {
            set('name', e.target.value);
            if (!slugTouched) set('slug', slugify(e.target.value));
          }}
          className={inputClass}
        />
      </Field>

      <Field label="Slug" htmlFor="prod-slug" hint="Used in the URL, e.g. /product/iphone-15">
        <input
          id="prod-slug"
          required
          maxLength={250}
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            set('slug', slugify(e.target.value));
          }}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="prod-category">
          <select
            id="prod-category"
            required
            value={values.category_id ?? ''}
            onChange={(e) => set('category_id', Number(e.target.value))}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Brand" htmlFor="prod-brand">
          <select
            id="prod-brand"
            value={values.brand_id ?? ''}
            onChange={(e) => set('brand_id', e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          >
            <option value="">No brand</option>
            {brands.map((b) => (
              <option key={b.brand_id} value={b.brand_id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Model number" htmlFor="prod-model">
        <input
          id="prod-model"
          maxLength={150}
          value={values.model_number}
          onChange={(e) => set('model_number', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Description" htmlFor="prod-desc">
        <textarea
          id="prod-desc"
          rows={4}
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Main image URL" htmlFor="prod-image">
        <input
          id="prod-image"
          type="url"
          placeholder="https://..."
          value={values.image_url}
          onChange={(e) => set('image_url', e.target.value)}
          className={inputClass}
        />
      </Field>

      {mode === 'create' && (
        <fieldset className="space-y-4 rounded-xl border border-[#e5e5e5] p-4">
          <legend className="px-2 text-sm font-semibold text-[#252525]">First variant</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SKU" htmlFor="var-sku">
              <input id="var-sku" maxLength={100} value={values.sku} onChange={(e) => set('sku', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Variant name" htmlFor="var-name" hint="e.g. 128GB / Black">
              <input id="var-name" maxLength={200} value={values.variant_name} onChange={(e) => set('variant_name', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Price" htmlFor="var-price">
              <input id="var-price" type="number" required min="0" step="0.01" value={values.price} onChange={(e) => set('price', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Discount price" htmlFor="var-discount">
              <input id="var-discount" type="number" min="0" step="0.01" value={values.discount_price} onChange={(e) => set('discount_price', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Stock" htmlFor="var-stock">
              <input id="var-stock" type="number" required min="0" step="1" value={values.stock_quantity} onChange={(e) => set('stock_quantity', e.target.value)} className={inputClass} />
            </Field>
          </div>
        </fieldset>
      )}

      <CheckboxField id="prod-active" label="Visible in store" checked={values.is_active} onChange={(v) => set('is_active', v)} />

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? 'Saving...' : mode === 'create' ? 'Create product' : 'Save changes'}
        </button>
        <Link href="/admin/products" className={secondaryButtonClass}>
          Cancel
        </Link>
      </div>
    </form>
  );
}