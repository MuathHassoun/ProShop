// components/profile/ProfileSidebar.tsx
'use client';
import Link from 'next/link';
import { LogOut, Package, Heart, Bell, Settings, ChevronRight, ShieldCheck } from 'lucide-react';
import Avatar from './Avatar';

interface Props {
  name: string;
  avatarSrc: string | null;
  onLogout: () => void;
  active?: 'profile' | 'settings';
  isAdmin?: boolean;
}

const links = [
  {
    href: '/orders',
    label: 'My Orders',
    icon: Package,
  },
  {
    href: '/wishlist',
    label: 'Wishlist',
    icon: Heart,
  },
  {
    href: '/notifications',
    label: 'Notifications',
    icon: Bell,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

const navigationLinkClass =
  'group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#555555] transition-colors hover:bg-[#f5f5f5] hover:text-[#252525] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]';

export default function ProfileSidebar({
  name,
  avatarSrc,
  onLogout,
  active = 'profile',
  isAdmin = false,
}: Props) {
  const navLinks = isAdmin
    ? [...links, { href: '/admin', label: 'Admin panel', icon: ShieldCheck }]
    : links;

  return (
    <aside className="min-w-0 rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm lg:sticky lg:top-6">
      <Link
        href="/profile"
        aria-label="My profile"
        aria-current={active === 'profile' ? 'page' : undefined}
        className="flex min-w-0 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]"
      >
        <Avatar
          name={name}
          src={avatarSrc}
          className="size-14 shrink-0 border-2 border-[#fdde0b] text-base"
        />

        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-[#888888]">
            Welcome back
          </span>

          <span className="mt-1 block break-words text-base font-bold leading-snug text-[#252525]">
            {name}
          </span>
        </span>
      </Link>

      <div className="my-4 border-t border-[#eeeeee]" />

      <nav aria-label="Account navigation">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#999999]">
          Account
        </p>

        <ul className="space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={active === 'settings' && href === '/settings' ? 'page' : undefined}
                className={`${navigationLinkClass} ${
                  active === 'settings' && href === '/settings'
                    ? 'bg-[#f5f5f5] text-[#252525]'
                    : ''
                }`}
              >
                <Icon
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-[#888888] transition-colors group-hover:text-[#252525]"
                />

                <span className="flex-1">{label}</span>

                <ChevronRight
                  size={15}
                  aria-hidden="true"
                  className="shrink-0 text-[#bbbbbb] opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="my-4 border-t border-[#eeeeee]" />

      <button
        type="button"
        onClick={onLogout}
        className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        <LogOut size={18} aria-hidden="true" />

        <span>Logout</span>
      </button>
    </aside>
  );
}