// components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { ShoppingCart, User, Bookmark } from 'lucide-react';
import Search from './Search';

const actions = [
    { href: '/login', label: 'Login / Sign In', Icon: User },
    { href: '/wishlist', label: 'Wishlist', Icon: Bookmark },
    { href: '/cart', label: 'Cart', Icon: ShoppingCart },
];

export default function Header() {
    return (
        <header>
            <nav className="mx-auto flex max-w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 p-3 md:flex-nowrap md:gap-6 lg:px-8 dark:bg-black dark:text-white">
                {/* Logo */}
                <div className="order-1 shrink-0">
                    <Link href="/">
                        <h1 className="text-3xl font-bold sm:text-4xl lg:text-[45px]">
                            <span className="text-yellow-400">Pro</span>Shop
                        </h1>
                    </Link>
                </div>

                <div className="order-3 w-full md:order-2 md:w-auto md:max-w-xl md:flex-1 [&>*]:w-full">
                    <Search />
                </div>

                <div className="order-2 flex shrink-0 items-center gap-4 sm:gap-6 lg:gap-8 md:order-3">
                    {actions.map(({ href, label, Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            aria-label={label}
                            className="flex flex-col items-center gap-1 transition hover:text-primary-500 sm:gap-2"
                        >
                            <Icon className="size-5 sm:size-6" />
                            <p className="sr-only whitespace-nowrap text-xs sm:not-sr-only lg:text-sm">
                                {label}
                            </p>
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
}