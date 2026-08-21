"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type ContentSearchType = "all" | "news" | "recalls";



export default function ContentSearchBar({
  placeholder = "Search news and recalls...",
  type = "all",
  searchLength = 100,
  initialQuery = "",
  targetPath,
  preserveCurrentParams = false,
  resetParams = [],
}: {
  placeholder?: string;
  type?: ContentSearchType;
  searchLength?: number;
  initialQuery?: string;
  targetPath?: string;
  preserveCurrentParams?: boolean;
  resetParams?: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedQuery = query.trim().slice(0, searchLength);

    if (targetPath) {
      const params = preserveCurrentParams
        ? new URLSearchParams(searchParams.toString())
        : new URLSearchParams();

      if (trimmedQuery) {
        params.set("query", trimmedQuery);
      } else {
        params.delete("query");
      }

      for (const key of resetParams) {
        params.delete(key);
      }

      const qs = params.toString();
      router.push(`${targetPath}${qs ? `?${qs}` : ""}`);
      return;
    }

    const params = new URLSearchParams();

    if (trimmedQuery) params.set("query", trimmedQuery);
    if (type !== "all") params.set("type", type);

    const qs = params.toString();
    router.push(`/search${qs ? `?${qs}` : ""}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="relative sm:flex sm:items-center sm:gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          enterKeyHint="search"
          maxLength={searchLength}
          className="min-h-10 w-full flex-1 rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 pr-11 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] sm:pr-3"
        />

        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1 top-1/2 inline-grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] transition-[opacity,transform] duration-100 hover:opacity-90 active:scale-[0.94] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] motion-reduce:transform-none sm:static sm:inline-flex sm:size-auto sm:min-h-10 sm:translate-y-0 sm:items-center sm:justify-center sm:px-4 sm:py-2 sm:text-sm sm:font-semibold"
        >
          <Search size={16} className="sm:hidden" aria-hidden="true" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </form>
  );
}