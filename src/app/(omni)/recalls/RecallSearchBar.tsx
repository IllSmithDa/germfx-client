"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RecallSearchBar({
  initialQuery = "",
  initialSource = "",
}: {
  initialQuery?: string;
  initialSource?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [source, setSource] = useState(initialSource);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("query", query.trim());
    } else {
      params.delete("query");
    }

    if (source.trim()) {
      params.set("source", source.trim());
    } else {
      params.delete("source");
    }

    params.set("page", "1");

    router.push(`/recalls?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recalls by product, reason, or company..."
          className="flex-1 rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />

        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        >
          <option value="">All sources</option>
          <option value="food">Food</option>
          <option value="drug">Medication</option>
        </select>

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