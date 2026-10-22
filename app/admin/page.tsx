// app/admin/page.tsx
import Link from 'next/link';
import { Suspense } from 'react';
import { AlertTriangle, Clock, Package, ShoppingBag, Users, Wallet } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import AdminLoading from '@/components/admin/AdminLoading';
import { requireAdminPage } from '@/lib/admin-auth';
import { LOW_STOCK_THRESHOLD, getDashboard } from '@/lib/admin-data';
import { formatDate, formatPrice } from '@/lib/format';

const panelClass = 'rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm';

async function DashboardContent() {
  await requireAdminPage();
  const { stats, recentOrders, lowStock } = await getDashboard();

  const cards = [
    { label: 'Revenue (paid)', value: formatPrice(stats.revenue), Icon: Wallet, href: '/admin/orders' },
    { label: 'Orders', value: String(stats.orders), Icon: ShoppingBag, href: '/admin/orders' },
    { label: 'Pending orders', value: String(stats.pendingOrders), Icon: Clock, href: '/admin/orders?status=pending' },
    { label: 'Active products', value: String(stats.activeProducts), Icon: Package, href: '/admin/products' },
    { label: 'Users', value: String(stats.users), Icon: Users, href: '/admin/users' },
    { label: `Low stock (≤ ${LOW_STOCK_THRESHOLD})`, value: String(stats.lowStock), Icon: AlertTriangle, href: '/admin/products' },
  ];

  return (
    <div className="space-y-6">
      <ul className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {cards.map(({ label, value, Icon, href }) => (
          <li key={label}>
            <Link href={href} className={`${panelClass} flex items-center gap-4 transition-colors hover:bg-[#fafafa]`}>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#fff8cc] text-[#252525]">
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xl font-bold text-[#252525]">{value}</span>
                <span className="block text-xs font-medium text-[#777777]">{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className={panelClass} aria-labelledby="recent-orders">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-orders" className="font-bold text-[#252525]">
            Recent orders
          </h2>
          <Link href="/admin/orders" className="text-sm font-medium text-[#555555] hover:text-[#252525]">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-[#777777]">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-[#999999]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Order</th>
                  <th className="px-3 py-2 font-semibold">Customer</th>
                  <th className="px-3 py-2 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Payment</th>
                  <th className="px-3 py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.order_id} className="border-t border-[#eeeeee]">
                    <td className="px-3 py-2.5 font-semibold">#{o.order_id}</td>
                    <td className="px-3 py-2.5">{o.full_name}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-[#777777]">{formatDate(o.created_at)}</td>
                    <td className="px-3 py-2.5"><StatusBadge value={o.status} /></td>
                    <td className="px-3 py-2.5"><StatusBadge value={o.payment_status} /></td>
                    <td className="px-3 py-2.5 text-right font-semibold">{formatPrice(o.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={panelClass} aria-labelledby="low-stock">
        <h2 id="low-stock" className="mb-3 font-bold text-[#252525]">
          Low stock
        </h2>
        {lowStock.length === 0 ? (
          <p className="text-sm text-[#777777]">Everything is well stocked.</p>
        ) : (
          <ul className="divide-y divide-[#eeeeee]">
            {lowStock.map((item) => (
              <li key={item.variant_id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0 truncate">
                  {item.product_name}
                  {item.variant_name ? <span className="text-[#777777]"> – {item.variant_name}</span> : null}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.stock_quantity === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {item.stock_quantity === 0 ? 'Out of stock' : `${item.stock_quantity} left`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <DashboardContent />
    </Suspense>
  );
}