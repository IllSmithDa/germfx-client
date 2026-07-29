"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BookmarkSearchBar({
  value,
  placeholder,
  buildHref,
}: {
  value: string;
  tabKey: "recalls" | "news";
  placeholder: string;
  buildHref: (query: string) => string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(value);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(buildHref(query.trim()));
      }}
      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm"
    >
      <div className="flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
        <button
          type="submit"
          className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))]"
        >
          Search
        </button>
      </div>
    </form>
  );
}