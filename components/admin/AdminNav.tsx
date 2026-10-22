// components/admin/AdminNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderTree, LayoutDashboard, Package, ShoppingBag, Users } from 'lucide-react';

const links = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', Icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', Icon: Package },
  { href: '/admin/categories', label: 'Categories', Icon: FolderTree },
  { href: '/admin/users', label: 'Users', Icon: Users },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin"
      className="flex gap-1 overflow-x-auto rounded-2xl border border-[#e5e5e5] bg-white p-2 shadow-sm lg:sticky lg:top-6 lg:flex-col"
    >
      {links.map(({ href, label, Icon, ...rest }) => {
        const active = 'exact' in rest ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525] ${
              active ? 'bg-[#fdde0b] text-[#252525]' : 'text-[#555555] hover:bg-[#f5f5f5] hover:text-[#252525]'
            }`}
          >
            <Icon size={18} aria-hidden="true" className="shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}