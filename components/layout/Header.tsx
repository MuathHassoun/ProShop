// components/layout/Header.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ShoppingCart,
    User,
    Bookmark,
    Menu,
    X,
    House,
    LayoutGrid,
    Package,
    ChevronRight,
} from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useAppSelector } from '@/store/hooks';
import Avatar from '@/components/profile/Avatar';
import { useAvatar } from '@/components/profile/useAvatar';
import { formatBadgeCount } from '@/lib/format';
import Search from './Search';

const subscribeNever = () => () => {};

const MENU_ID = 'mobile-navigation';

const desktopActions = [
    { href: '/wishlist', label: 'Wishlist', short: 'Wishlist', Icon: Bookmark, key: 'wishlist' },
    { href: '/cart', label: 'Cart', short: 'Cart', Icon: ShoppingCart, key: 'cart' },
] as const;

const browseLinks = [
    { href: '/', label: 'Home', Icon: House },
    { href: '/products', label: 'All products', Icon: Package },
    { href: '/categories', label: 'Categories', Icon: LayoutGrid },
] as const;

const menuLinkClass =
    'flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium transition hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 dark:hover:bg-gray-900';

function CountBadge({ count, className = '' }: { count: number; className?: string }) {
    if (count <= 0) return null;
    return (
        <span
            aria-hidden="true"
            className={`pointer-events-none flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-yellow-400 px-1 text-[11px] font-bold leading-none text-black ${className}`}
        >
            {formatBadgeCount(count)}
        </span>
    );
}

export default function Header() {
    const pathname = usePathname();
    const user = useAppSelector((state) => state.user.userInfo);
    const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
    const avatar = useAvatar(user?.user_id, user?.avatar_url);
    const firstName = user?.full_name.trim().split(/\s+/)[0] || '';

    const cartTotal = useAppSelector((s) => s.cart.cartItems.reduce((n, i) => n + i.quantity, 0));
    const wishlistTotal = useAppSelector((s) => s.wishlist.items.length);
    const counts: Record<'cart' | 'wishlist', number> = {
        cart: mounted ? cartTotal : 0,
        wishlist: mounted ? wishlistTotal : 0,
    };

    const [openOn, setOpenOn] = useState<string | null>(null);
    const isMenuOpen = openOn === pathname;
    const openMenu = () => setOpenOn(pathname);
    const closeMenu = () => setOpenOn(null);

    const panelRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isMenuOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const trigger = triggerRef.current;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenOn(null);
                return;
            }
            if (event.key !== 'Tab') return;

            const focusable = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)');
            if (!focusable?.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        closeButtonRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
            trigger?.focus();
        };
    }, [isMenuOpen]);

    useEffect(() => {
        if (!isMenuOpen) return;
        const mq = window.matchMedia('(min-width: 768px)');
        const onChange = (e: MediaQueryListEvent) => {
            if (e.matches) setOpenOn(null);
        };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [isMenuOpen]);

    const countLabel = (label: string, n: number) => (n > 0 ? `${label}, ${n} ${n === 1 ? 'item' : 'items'}` : label);

    return (
        <header className="w-full border-b border-gray-200 dark:border-gray-800 dark:bg-black dark:text-white">
            <nav
                aria-label="Main"
                className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-between gap-x-3 gap-y-3 px-3 py-3 sm:px-6 md:flex-nowrap md:gap-x-6"
            >
                <div className="order-1 shrink-0">
                    <Link href="/" aria-label="ProShop home">
                        <span className="block text-2xl font-bold sm:text-3xl lg:text-4xl xl:text-[45px]">
                            <span className="text-yellow-400">Pro</span>Shop
                        </span>
                    </Link>
                </div>

                <div className="order-3 w-full min-w-0 md:order-2 md:w-auto md:max-w-xl md:flex-1 [&>*]:w-full">
                    <Search />
                </div>

                {/* Mobile: cart shortcut + menu button */}
                <div className="order-2 flex shrink-0 items-center gap-1 md:hidden">
                    <Link
                        href="/cart"
                        aria-label={countLabel('Cart', counts.cart)}
                        className="relative grid size-11 place-items-center rounded-full transition hover:bg-gray-100 hover:text-primary-500 dark:hover:bg-gray-900"
                    >
                        <ShoppingCart className="size-6" />
                        <CountBadge count={counts.cart} className="absolute right-0 top-0" />
                    </Link>
                    <button
                        ref={triggerRef}
                        type="button"
                        onClick={isMenuOpen ? closeMenu : openMenu}
                        aria-label="Open menu"
                        aria-expanded={isMenuOpen}
                        aria-controls={MENU_ID}
                        className="grid size-11 cursor-pointer place-items-center rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-900"
                    >
                        <Menu className="size-6" />
                    </button>
                </div>

                {/* Desktop actions */}
                <div className="order-3 hidden shrink-0 items-center gap-5 md:flex lg:gap-6 xl:gap-8">
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
                            <span className="hidden whitespace-nowrap text-xs lg:inline xl:hidden">{firstName}</span>
                            <span className="hidden whitespace-nowrap text-sm xl:inline">{user.full_name}</span>
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
                    {desktopActions.map(({ href, label, short, Icon, key }) => (
                        <Link
                            key={href}
                            href={href}
                            aria-label={countLabel(label, counts[key])}
                            className="flex flex-col items-center gap-1 p-1 transition hover:text-primary-500"
                        >
                            <span className="relative">
                                <Icon className="size-6 lg:size-5 xl:size-6" />
                                <CountBadge count={counts[key]} className="absolute -right-2.5 -top-2" />
                            </span>
                            <span className="hidden whitespace-nowrap text-xs lg:inline xl:hidden">{short}</span>
                            <span className="hidden whitespace-nowrap text-sm xl:inline">{label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <button
                        type="button"
                        aria-label="Close menu"
                        tabIndex={-1}
                        onClick={closeMenu}
                        className="absolute inset-0 h-full w-full cursor-default bg-black/50"
                    />

                    <div
                        id={MENU_ID}
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu"
                        className="absolute right-0 top-0 flex h-full w-[min(20rem,88vw)] flex-col overflow-y-auto bg-white text-black shadow-xl dark:bg-black dark:text-white"
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                            <span className="text-2xl font-bold">
                                <span className="text-yellow-400">Pro</span>Shop
                            </span>
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={closeMenu}
                                aria-label="Close menu"
                                className="grid size-11 cursor-pointer place-items-center rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-900"
                            >
                                <X className="size-6" />
                            </button>
                        </div>

                        <div className="flex flex-1 flex-col gap-6 px-3 py-4">
                            <div>
                                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Browse</p>
                                <ul>
                                    {browseLinks.map(({ href, label, Icon }) => (
                                        <li key={href}>
                                            <Link
                                                href={href}
                                                onClick={closeMenu}
                                                aria-current={pathname === href ? 'page' : undefined}
                                                className={`${menuLinkClass} ${pathname === href ? 'bg-yellow-50 dark:bg-gray-900' : ''}`}
                                            >
                                                <Icon className="size-5 shrink-0 text-gray-500" aria-hidden="true" />
                                                <span className="flex-1">{label}</span>
                                                <ChevronRight className="size-4 text-gray-400" aria-hidden="true" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Account</p>
                                <ul>
                                    <li>
                                        {mounted && user ? (
                                            <Link href="/profile" onClick={closeMenu} className={menuLinkClass}>
                                                {avatar.src ? (
                                                    <Avatar name={user.full_name} src={avatar.src} className="size-6 shrink-0 rounded-full object-cover" />
                                                ) : (
                                                    <User className="size-5 shrink-0 text-gray-500" aria-hidden="true" />
                                                )}
                                                <span className="min-w-0 flex-1 truncate">{user.full_name}</span>
                                                <ChevronRight className="size-4 text-gray-400" aria-hidden="true" />
                                            </Link>
                                        ) : (
                                            <Link href="/login" onClick={closeMenu} className={menuLinkClass}>
                                                <User className="size-5 shrink-0 text-gray-500" aria-hidden="true" />
                                                <span className="flex-1">Login / Sign In</span>
                                                <ChevronRight className="size-4 text-gray-400" aria-hidden="true" />
                                            </Link>
                                        )}
                                    </li>
                                    {desktopActions.map(({ href, label, Icon, key }) => (
                                        <li key={href}>
                                            <Link
                                                href={href}
                                                onClick={closeMenu}
                                                aria-label={countLabel(label, counts[key])}
                                                aria-current={pathname === href ? 'page' : undefined}
                                                className={`${menuLinkClass} ${pathname === href ? 'bg-yellow-50 dark:bg-gray-900' : ''}`}
                                            >
                                                <Icon className="size-5 shrink-0 text-gray-500" aria-hidden="true" />
                                                <span className="flex-1">{label}</span>
                                                <CountBadge count={counts[key]} />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
