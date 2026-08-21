"use client";

import ContentSearchBar from "@/components/ContentSearchBar/ContentSearchBar";

type SearchType = "all" | "recalls" | "news";

export function SearchForm({
  query,
  type,
}: {
  query: string;
  type: SearchType;
}) {
  return (
    <ContentSearchBar
      type={type}
      placeholder="Search recalls and news..."
      searchLength={100}
      initialQuery={query}
    />
  );
}