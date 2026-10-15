// components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { ShoppingCart, User, Bookmark } from 'lucide-react';
import Search from './Search';

const actions = [
    { href: '/login', label: 'Login / Sign In', short: 'Login', Icon: User },
    { href: '/wishlist', label: 'Wishlist', short: 'Wishlist', Icon: Bookmark },
    { href: '/cart', label: 'Cart', short: 'Cart', Icon: ShoppingCart },
];

export default function Header() {
    return (
        <header className="w-full border-b border-gray-200 dark:border-gray-800 dark:bg-black dark:text-white">
            <nav className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-between gap-x-3 gap-y-3 px-3 py-3 sm:px-6 md:flex-nowrap md:gap-x-6">
                <div className="order-1 shrink-0">
                    <Link href="/" aria-label="ProShop home">
                        <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl xl:text-[45px]">
                            <span className="text-yellow-400">Pro</span>Shop
                        </h1>
                    </Link>
                </div>

                <div className="order-3 w-full min-w-0 md:order-2 md:w-auto md:max-w-xl md:flex-1 [&>*]:w-full">
                    <Search />
                </div>

                <div className="order-2 flex shrink-0 items-center gap-3 sm:gap-5 lg:gap-6 xl:gap-8 md:order-3">
                    {actions.map(({ href, label, short, Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            aria-label={label}
                            className="flex flex-col items-center gap-1 p-1 transition hover:text-primary-500"
                        >
                            <Icon className="size-6 lg:size-5 xl:size-6" />
                            <span className="hidden whitespace-nowrap text-xs lg:inline xl:hidden">
                                {short}
                            </span>
                            <span className="hidden whitespace-nowrap text-sm xl:inline">
                                {label}
                            </span>
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
}