// app/admin/orders/page.tsx
import Link from 'next/link';
import { Suspense } from 'react';
import AdminPager from '@/components/admin/AdminPager';
import OrderControls from '@/components/admin/OrderControls';
import AdminLoading from '@/components/admin/AdminLoading';
import { requireAdminPage } from '@/lib/admin-auth';
import { ADMIN_PAGE_SIZE, ORDER_STATUSES, listOrders, parseListParams } from '@/lib/admin-data';
import { formatDate, formatPrice } from '@/lib/format';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

async function OrdersContent({ searchParams }: PageProps) {
  await requireAdminPage();
  const { status, page, offset } = parseListParams(await searchParams);
  const activeStatus = (ORDER_STATUSES as readonly string[]).includes(status) ? status : '';
  const { rows, total } = await listOrders(activeStatus, offset);

  const tab = (value: string, label: string) => (
    <Link
      key={value}
      href={value ? `/admin/orders?status=${value}` : '/admin/orders'}
      aria-current={activeStatus === value ? 'page' : undefined}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
        activeStatus === value ? 'bg-[#252525] text-white' : 'bg-white text-[#555555] hover:bg-[#f0f0f0]'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <section aria-labelledby="orders-heading" className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
      <h2 id="orders-heading" className="text-lg font-bold text-[#252525]">
        Orders
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {tab('', 'All')}
        {ORDER_STATUSES.map((s) => tab(s, s))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-[#999999]">
            <tr>
              <th className="px-3 py-2 font-semibold">Order</th>
              <th className="px-3 py-2 font-semibold">Customer</th>
              <th className="px-3 py-2 font-semibold">Date</th>
              <th className="px-3 py-2 text-right font-semibold">Total</th>
              <th className="px-3 py-2 font-semibold">Status / payment</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-[#777777]">
                  No orders found.
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o.order_id} className="border-t border-[#eeeeee] align-top">
                  <td className="px-3 py-3 font-semibold">#{o.order_id}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium">{o.full_name}</p>
                    <p className="text-xs text-[#777777]">{o.email}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-[#777777]">{formatDate(o.created_at)}</td>
                  <td className="px-3 py-3 text-right font-semibold">{formatPrice(o.total_amount)}</td>
                  <td className="px-3 py-3">
                    <OrderControls orderId={o.order_id} status={o.status} paymentStatus={o.payment_status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminPager
        basePath="/admin/orders"
        params={{ status: activeStatus }}
        page={page}
        total={total}
        pageSize={ADMIN_PAGE_SIZE}
      />
    </section>
  );
}

export default function AdminOrdersPage(props: PageProps) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <OrdersContent {...props} />
    </Suspense>
  );
}