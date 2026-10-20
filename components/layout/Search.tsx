// components/layout/Search.tsx
'use client';
import React, { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, SearchIcon, TrendingUp, X } from 'lucide-react';

const RECENT_KEY = 'proshop:recent-searches';
const MAX_RECENT = 5;
const RECOMMENDED = ['Iphone', 'Samsung', 'Apple', 'Macbook', 'Headphones', 'Smart watch'];

type Suggestion = { text: string; kind: 'recent' | 'recommended' };

const EMPTY: string[] = [];
let cache: string[] | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
    if (cache) return cache;
    try {
        const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
        cache = Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string').slice(0, MAX_RECENT) : [];
    } catch {
        cache = [];
    }
    return cache;
}

function write(next: string[]) {
    cache = next;
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
    }
    listeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => {
        listeners.delete(cb);
    };
};

const addRecent = (term: string) =>
    write([term, ...read().filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENT));
const removeRecent = (term: string) => write(read().filter((s) => s !== term));

export default function Search() {
    const router = useRouter();
    const listId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [value, setValue] = useState('');
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);

    const recent = useSyncExternalStore(subscribe, read, () => EMPTY);

    const q = value.trim().toLowerCase();
    const suggestions: Suggestion[] = [
        ...recent
            .filter((s) => !q || s.toLowerCase().includes(q))
            .map((text): Suggestion => ({ text, kind: 'recent' })),
        ...RECOMMENDED.filter(
            (s) => (!q || s.toLowerCase().includes(q)) && !recent.some((r) => r.toLowerCase() === s.toLowerCase())
        ).map((text): Suggestion => ({ text, kind: 'recommended' })),
    ];

    const close = useCallback(() => {
        setOpen(false);
        setActive(-1);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) close();
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open, close]);

    const submit = (term: string) => {
        const text = term.trim();
        if (!text) return;
        addRecent(text);
        setValue(text);
        close();
        inputRef.current?.blur();
        router.push(`/products?q=${encodeURIComponent(text)}`);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!open) return setOpen(true);
            setActive((i) => (suggestions.length ? (i + 1) % suggestions.length : -1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!open) return setOpen(true);
            setActive((i) => (suggestions.length ? (i <= 0 ? suggestions.length - 1 : i - 1) : -1));
        } else if (e.key === 'Escape') {
            close();
        } else if (e.key === 'Enter' && open && active >= 0 && suggestions[active]) {
            e.preventDefault();
            submit(suggestions[active].text);
        }
    };

    const showList = open && suggestions.length > 0;
    const optionId = (i: number) => `${listId}-opt-${i}`;

    return (
        <div ref={rootRef} className="relative">
            <form
                role="search"
                onSubmit={(e) => {
                    e.preventDefault();
                    submit(value);
                }}
                className="flex w-full items-center overflow-hidden rounded-lg bg-white"
            >
                <input
                    ref={inputRef}
                    className="min-w-0 flex-1 rounded-lg bg-white py-2 pl-4 text-sm text-black focus:border-none focus:outline-none focus:ring-0 sm:pl-6 sm:text-base md:pl-8"
                    type="text"
                    placeholder="Iphone, Samsung, Apple, Macbook..."
                    aria-label="Search products"
                    role="combobox"
                    aria-expanded={showList}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
                    autoComplete="off"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setActive(-1);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onClick={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                />
                <button
                    className="flex shrink-0 cursor-pointer items-center gap-2 bg-yellow-400 px-4 py-2 text-black transition hover:text-primary-500 sm:px-6 lg:px-8"
                    type="submit"
                    aria-label="Search"
                >
                    <SearchIcon className="size-5" />
                    <span className="hidden sm:inline">Search</span>
                </button>
            </form>

            {showList && (
                <ul
                    id={listId}
                    role="listbox"
                    aria-label="Search suggestions"
                    className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 text-left text-black shadow-lg"
                >
                    {suggestions.map((s, i) => {
                        const Icon = s.kind === 'recent' ? Clock : TrendingUp;
                        return (
                            <li
                                key={`${s.kind}-${s.text}`}
                                id={optionId(i)}
                                role="option"
                                aria-selected={i === active}
                                onMouseDown={(e) => e.preventDefault()}
                                onMouseEnter={() => setActive(i)}
                                className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm sm:text-base ${
                                    i === active ? 'bg-gray-100' : ''
                                }`}
                            >
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => submit(s.text)}
                                    className="flex cursor-pointer min-w-0 flex-1 items-center gap-3 text-left"
                                >
                                    <Icon className="size-4 shrink-0 text-gray-400" aria-hidden />
                                    <span className="truncate">{s.text}</span>
                                    <span className="sr-only">
                                        {s.kind === 'recent' ? '(recent search)' : '(recommended)'}
                                    </span>
                                </button>
                                {s.kind === 'recent' && (
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        aria-label={`Remove ${s.text} from recent searches`}
                                        onClick={() => removeRecent(s.text)}
                                        className="grid size-7 shrink-0 place-items-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-black"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}