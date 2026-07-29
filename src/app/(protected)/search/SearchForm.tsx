"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";

type SearchType = "all" | "recalls" | "news";
function buildSearchHref({
  query,
  type,
  page,
}: {
  query: string;
  type: SearchType;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (query) params.set("query", query);
  if (type !== "all") params.set("type", type);
  if (page && page > 1) params.set("page", String(page));

  const qs = params.toString();
  return `/search${qs ? `?${qs}` : ""}`;
}


export function SearchForm({ query, type }: { query: string; type: SearchType }) {
  const router = useRouter();
  const [value, setValue] = useState(query);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(buildSearchHref({ query: value.trim(), type }));
      }}
      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search recalls and news..."
          className="flex-1 rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />

        <button
          type="submit"
          className="rounded-xl bg-[hsl(var(--primary))] px-5 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90"
        >
          Search
        </button>
      </div>
    </form>
  );
}