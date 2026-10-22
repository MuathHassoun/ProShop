// app/admin/layout.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminLoading from '@/components/admin/AdminLoading';
import AdminNav from '@/components/admin/AdminNav';
import { requireAdminPage } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'Admin | ProShop',
  robots: { index: false, follow: false },
};

async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();

  return (
    <div className="min-h-[60vh] bg-[#fafafa]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-7">
          <p className="text-sm font-medium text-[#777777]">Administration</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#252525] sm:text-3xl">Admin panel</h1>
          <p className="mt-2 text-sm text-[#777777]">Signed in as {admin.full_name}</p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <AdminNav />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}