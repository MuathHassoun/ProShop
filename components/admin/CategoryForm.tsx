// components/admin/CategoryForm.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckboxField, Field, FormError, inputClass, primaryButtonClass, secondaryButtonClass, slugify } from './fields';
import { sendJson } from './patch';

export interface CategoryFormValues {
  name: string;
  slug: string;
  parent_id: number | null;
  description: string;
  image_url: string;
  is_active: boolean;
}

interface Props {
  mode: 'create' | 'edit';
  categoryId?: number;
  parents: { category_id: number; name: string }[];
  initial: CategoryFormValues;
}

export default function CategoryForm({ mode, categoryId, parents, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const url = mode === 'create' ? '/api/admin/categories' : `/api/admin/categories/${categoryId}`;
    const { error: message } = await sendJson(mode === 'create' ? 'POST' : 'PATCH', url, { ...values });
    setSaving(false);
    if (message) return setError(message);
    router.push('/admin/categories');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <FormError message={error} />

      <Field label="Name" htmlFor="cat-name">
        <input
          id="cat-name"
          required
          maxLength={100}
          value={values.name}
          onChange={(e) => {
            set('name', e.target.value);
            if (!slugTouched) set('slug', slugify(e.target.value));
          }}
          className={inputClass}
        />
      </Field>

      <Field label="Slug" htmlFor="cat-slug" hint="Used in the URL, e.g. /category/laptops">
        <input
          id="cat-slug"
          required
          maxLength={150}
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            set('slug', slugify(e.target.value));
          }}
          className={inputClass}
        />
      </Field>

      <Field label="Parent category" htmlFor="cat-parent">
        <select
          id="cat-parent"
          value={values.parent_id ?? ''}
          onChange={(e) => set('parent_id', e.target.value ? Number(e.target.value) : null)}
          className={inputClass}
        >
          <option value="">None (top level)</option>
          {parents.map((p) => (
            <option key={p.category_id} value={p.category_id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Description" htmlFor="cat-desc">
        <textarea
          id="cat-desc"
          rows={3}
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Image URL" htmlFor="cat-image">
        <input
          id="cat-image"
          type="url"
          placeholder="https://..."
          value={values.image_url}
          onChange={(e) => set('image_url', e.target.value)}
          className={inputClass}
        />
      </Field>

      <CheckboxField id="cat-active" label="Visible in store" checked={values.is_active} onChange={(v) => set('is_active', v)} />

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? 'Saving...' : mode === 'create' ? 'Create category' : 'Save changes'}
        </button>
        <Link href="/admin/categories" className={secondaryButtonClass}>
          Cancel
        </Link>
      </div>
    </form>
  );
}