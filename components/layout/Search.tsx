import React from "react";
import { SearchIcon } from "lucide-react";

// To Do: Show a dropdown of search suggestions (recent or recommended queries) when the input is focused.
export default function Search() {
    return (
        <div className="flex w-full items-center overflow-hidden rounded-lg bg-white">
            <input
                className="min-w-0 flex-1 rounded-lg bg-white py-2 pl-4 text-sm text-black focus:border-none focus:outline-none focus:ring-0 sm:pl-6 sm:text-base md:pl-8"
                type="text"
                placeholder="Iphone, Samsung, Apple, Macbook..."
                aria-label="Search products"
            />
            <button
                className="flex shrink-0 cursor-pointer items-center gap-2 bg-yellow-400 px-4 py-2 text-black transition hover:text-primary-500 sm:px-6 lg:px-8"
                type="submit"
                aria-label="Search"
            >
                <SearchIcon className="size-5" />
                <span className="hidden sm:inline">Search</span>
            </button>
        </div>
    );
}