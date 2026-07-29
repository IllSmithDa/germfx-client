"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ContentSearchType = "all" | "news" | "recalls";



export default function ContentSearchBar({
  placeholder = "Search news and recalls...",
  type = "all",
  searchLength = 100
}: {
  placeholder?: string;
  type?: ContentSearchType;
  searchLength ?: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();

    if (query.trim()) params.set("query", query.trim());
    if (type !== "all") params.set("type", type);

    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="min-h-10 flex-1 rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))]"
          maxLength={searchLength}
        />

        <button
          type="submit"
          className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 cursor-pointer"
        >
          Search
        </button>
      </div>
    </form>
  );
}