"use client";

import SharedTabs, {
  type SharedTabItem,
} from "@/components/SharedTabs/SharedTabs";

type SearchType = "all" | "recalls" | "news";

function buildSearchHref({
  query,
  type,
}: {
  query: string;
  type: SearchType;
}) {
  const params = new URLSearchParams();

  if (query) params.set("query", query);
  if (type !== "all") params.set("type", type);

  const qs = params.toString();
  return `/search${qs ? `?${qs}` : ""}`;
}

export default function SearchTabs({
  query,
  activeType,
}: {
  query: string;
  activeType: SearchType;
}) {
  const tabs: SharedTabItem<SearchType>[] = [
    {
      id: "all",
      label: "All",
      href: buildSearchHref({ query, type: "all" }),
    },
    {
      id: "recalls",
      label: "Recalls",
      href: buildSearchHref({ query, type: "recalls" }),
    },
    {
      id: "news",
      label: "News",
      href: buildSearchHref({ query, type: "news" }),
    },
  ];

  return (
    <div className="max-lg:[&>[role=none]]:pb-0">
      <SharedTabs
        tabs={tabs}
        activeTab={activeType}
        ariaLabel="Search result tabs"
      />
    </div>
  );
}