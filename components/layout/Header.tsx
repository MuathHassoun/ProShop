// components/layout/Header.tsx
'use client';
import Link from 'next/link';
import { ShoppingCart, User, Bookmark } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { useAppSelector } from '@/store/hooks';
import Avatar from '@/components/profile/Avatar';
import { useAvatar } from '@/components/profile/useAvatar';
import Search from './Search';

const subscribeNever = () => () => {};

const actions = [
    { href: '/wishlist', label: 'Wishlist', short: 'Wishlist', Icon: Bookmark },
    { href: '/cart', label: 'Cart', short: 'Cart', Icon: ShoppingCart },
];

export default function Header() {
    const user = useAppSelector((state) => state.user.userInfo);
    const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
    const avatar = useAvatar(user?.user_id, user?.avatar_url);
    const firstName = user?.full_name.trim().split(/\s+/)[0] || '';

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
                    {!mounted ? (
                        <span aria-hidden="true" className="flex flex-col items-center gap-1 p-1">
                            <User className="size-6 lg:size-5 xl:size-6" />
                            <span className="invisible hidden whitespace-nowrap text-xs lg:inline xl:hidden">Login</span>
                            <span className="invisible hidden whitespace-nowrap text-sm xl:inline">Login / Sign In</span>
                        </span>
                    ) : user ? (
                        <Link
                            href="/profile"
                            aria-label={`My profile, ${user.full_name}`}
                            className="flex flex-col items-center gap-1 p-1 transition hover:text-primary-500"
                        >
                            {avatar.src ? (
                                <Avatar name={user.full_name} src={avatar.src} className="size-6 rounded-full object-cover lg:size-5 xl:size-6" />
                            ) : (
                                <User className="size-6 lg:size-5 xl:size-6" />
                            )}
                            <span className="hidden whitespace-nowrap text-xs lg:inline xl:hidden">
                                {firstName}
                            </span>
                            <span className="hidden whitespace-nowrap text-sm xl:inline">
                                {user.full_name}
                            </span>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            aria-label="Login / Sign In"
                            className="flex flex-col items-center gap-1 p-1 transition hover:text-primary-500"
                        >
                            <User className="size-6 lg:size-5 xl:size-6" />
                            <span className="hidden whitespace-nowrap text-xs lg:inline xl:hidden">Login</span>
                            <span className="hidden whitespace-nowrap text-sm xl:inline">Login / Sign In</span>
                        </Link>
                    )}
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
