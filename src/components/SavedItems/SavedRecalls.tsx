/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type { SavedItem, SavedItemsResponse } from "@/lib/server/fetchSavedItems";
import UnsaveButton from "./UnsaveButton";
import { SavedItemsSort } from "@/types";
import SavedItemSortSelect from "./SavedItemSortSelect";
import SavedItemPagination from "./SavedItemPagination";

function formatDate(value?: string | null) {
  if (!value) return null;

  if (/^\d{8}$/.test(value)) {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);
    return new Date(`${year}-${month}-${day}T00:00:00`).toLocaleDateString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
}

function getSnapshotString(item: SavedItem, key: string) {
  const value = item.snapshot_json?.[key];
  return typeof value === "string" ? value : null;
}

function RecallSavedCard({ item }: { item: SavedItem }) {
  const classification = getSnapshotString(item, "classification");
  const status = getSnapshotString(item, "status");
  const company = getSnapshotString(item, "company");
  const distribution = getSnapshotString(item, "distribution");

  return (
    <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
          Saved Recall
        </span>

        {classification && (
          <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2 py-1 text-[11px] text-[hsl(var(--muted-foreground))]">
            {classification}
          </span>
        )}

        {status && (
          <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2 py-1 text-[11px] text-[hsl(var(--muted-foreground))]">
            {status}
          </span>
        )}

        <UnsaveButton savedItemId={item.id} />
      </div>

      <h3 className="mt-3 text-base font-semibold leading-6">{item.title}</h3>

      {item.summary && (
        <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
          {item.summary}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-[hsl(var(--muted-foreground))]">
        {item.source_label && <span>Source: {item.source_label}</span>}
        {item.published_at && <span>{formatDate(item.published_at)}</span>}
        {company && <span>Company: {company}</span>}
      </div>

      {distribution && (
        <div className="mt-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Distribution
          </p>
          <p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            {distribution}
          </p>
        </div>
      )}
    </article>
  );
}

export default function SavedRecalls({
  recalls,
  currentPage,
  query,
  newsQuery,
  pageSize,
  sort,
  newsSort,
  baseUrl,
}: {
  recalls: SavedItemsResponse;
  currentPage: number;
  query: string;
  newsQuery: string;
  pageSize: number;
  sort: SavedItemsSort;
  newsSort?: SavedItemsSort;
  baseUrl?: string;
}) {
  const totalPages = Math.max(1, Math.ceil((recalls.total || 0) / pageSize));

  return (
    <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm sm:p-5">
      <div className="mb-4 w-full sm:flex sm:justify-end">
        <SavedItemSortSelect
          value={sort}
          baseUrl={baseUrl as string}
          sortParam="s_recall_sort"
          pageParam="s_recall_page"
          extraParams={
            baseUrl === "/bookmarks"
              ? { tab: "recalls", news_query: newsQuery }
              : { view: "saved" }
          }
        />
      </div>

      {/*
      <BookmarkSearchBar
        value={query}
        tabKey="recalls"
        placeholder="Search saved recalls..."
        buildHref={(nextQuery) => {
          const params = new URLSearchParams();
          params.set("tab", "recalls");
          if (nextQuery) params.set("recall_query", nextQuery);
          if (newsQuery) params.set("news_query", newsQuery);
          return `/bookmarks?${params.toString()}`;
        }}
      />
        */}

      {recalls.items.length === 0 ? (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-sm text-[hsl(var(--muted-foreground))]">
          No saved recalls found.
        </div>
      ) : (
        <div className="space-y-4">
          {recalls.items.map((item) => (
            <RecallSavedCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <SavedItemPagination
        baseUrl={baseUrl as string}
        currentPage={currentPage}
        totalPages={totalPages}
        query={query}
        sort={sort}
        pageParam="s_recall_page"
        sortParam="s_recall_sort"
        extraParams={
          baseUrl === "/bookmarks"
            ? { tab: "recalls", news_query: newsQuery }
            : { view: "saved" }
        }
      />
    </div>
  );
}