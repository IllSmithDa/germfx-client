import Link from "next/link";

import SavedNews from "@/components/SavedItems/SavedNews";
import UsageLimitNotice from "@/components/UsageLimitNotice/UsageLimitNotice";

import { getArticlesRequest } from "@/lib/server/articlesServerApi";
import { fetchSavedItems } from "@/lib/server/fetchSavedItems";

import {
  fetchBulkReactionSummaries,
  fetchBulkSavedChecks,
} from "@/lib/server/bulkContentApi";

import NewsSortSelect from "./NewsSortSelect";

import type { NewsSort } from "@/types/news";
import type { SavedItemsSort } from "@/types";
import { fetchUsageLimitStatus } from "@/lib/server/fetchLimitUsageStatus";
import NewsListView from "@/components/NewsListView/NewsListView";

const PAGE_SIZE = 10;

function buildNewsPageHref({
  page,
  query,
  sort,
}: {
  page: number;
  query: string;
  sort: NewsSort;
}) {
  const params = new URLSearchParams();

  if (page > 1) params.set("page", String(page));
  if (query) params.set("query", query);
  if (sort !== "latest") params.set("sort", sort);

  const qs = params.toString();
  return `/news${qs ? `?${qs}` : ""}`;
}

function buildSavedNewsHref({
  savedPage,
  query,
  savedSort,
}: {
  savedPage: number;
  query: string;
  savedSort: SavedItemsSort;
}) {
  const params = new URLSearchParams();

  params.set("view", "saved");

  if (savedPage > 1) {
    params.set("savedPage", String(savedPage));
  }

  if (query) {
    params.set("query", query);
  }

  if (savedSort !== "newest") {
    params.set("savedSort", savedSort);
  }

  const qs = params.toString();
  return `/news${qs ? `?${qs}` : ""}`;
}

function SavedNewsLoginRequired({
  query,
  savedPage,
  savedSort,
}: {
  query: string;
  savedPage: number;
  savedSort: SavedItemsSort;
}) {
  const nextHref = buildSavedNewsHref({
    savedPage,
    query,
    savedSort,
  });

  const loginHref = `/login?next=${encodeURIComponent(nextHref)}`;

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
        Log in to view saved news
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-[hsl(var(--muted-foreground))]">
        Saved news is tied to your account. Log in to view saved articles and
        manage your saved news and recall items.
      </p>

      <div className="mt-5 flex justify-center">
        <Link
          href={loginHref}
          className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

export default async function NewsResults({
  view,
  page,
  savedPage,
  query,
  sort,
  savedSort,
  userId,
}: {
  view: "all" | "saved";
  page: number;
  savedPage: number;
  query: string;
  sort: NewsSort;
  savedSort: SavedItemsSort;
  userId?: number | string | null;
}) {
  const isLoggedIn = Boolean(userId);

  if (view === "saved") {
    if (!isLoggedIn) {
      return (
        <SavedNewsLoginRequired
          query={query}
          savedPage={savedPage}
          savedSort={savedSort}
        />
      );
    }

    const safeSavedPage = Math.max(1, savedPage);
    const skip = (safeSavedPage - 1) * PAGE_SIZE;

    const [savedNewsResponse, savedItemsUsageStatus] = await Promise.all([
      fetchSavedItems({
        content_type: "news",
        query: query || undefined,
        limit: PAGE_SIZE,
        skip,
        sort: savedSort,
      }),
      fetchUsageLimitStatus("saved_items"),
    ]);

    const totalPages = Math.max(
      1,
      Math.ceil((savedNewsResponse.total ?? 0) / PAGE_SIZE),
    );

    const finalSavedPage = Math.min(safeSavedPage, totalPages);

    return (
      <div className="space-y-4">
        <UsageLimitNotice
          featureKey="saved_items"
          status={savedItemsUsageStatus}
        />

        <SavedNews
          news={savedNewsResponse}
          currentPage={finalSavedPage}
          query={query}
          recallQuery=""
          pageSize={PAGE_SIZE}
          sort={savedSort}
          recallSort="newest"
          baseUrl="/news"
        />
      </div>
    );
  }

  const safePage = Math.max(1, page);

  const articlesResponse = await getArticlesRequest(
    safePage,
    PAGE_SIZE,
    query || undefined,
    sort,
  );

  const articleIds = articlesResponse.items?.map((article) => article.id) ?? [];

  const [reactionMap, savedMap, savedItemsUsageStatus] = await Promise.all([
    articleIds.length
      ? fetchBulkReactionSummaries("news", articleIds)
      : Promise.resolve({}),

    isLoggedIn && articleIds.length
      ? fetchBulkSavedChecks("news", articleIds)
      : Promise.resolve({}),

    isLoggedIn
      ? fetchUsageLimitStatus("saved_items")
      : Promise.resolve(null),
  ]);

  const totalPages = Math.max(1, articlesResponse.total_pages ?? 1);
  const finalPage = Math.min(safePage, totalPages);
  const prevPage = finalPage > 1 ? finalPage - 1 : null;
  const nextPage = finalPage < totalPages ? finalPage + 1 : null;

  return (
    <div className="border-0 bg-transparent p-2 sm:rounded-2xl sm:border sm:border-[hsl(var(--border))] sm:bg-[hsl(var(--card))] sm:p-5">
      <div className="mb-2 sm:mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Page {finalPage} of {totalPages}
        </p>

        <div className="grid w-full gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">

          <NewsSortSelect value={sort} />
        </div>
      </div>

      <div className="mb-3">
        <UsageLimitNotice
          featureKey="saved_items"
          status={savedItemsUsageStatus}
        />
      </div>

      <NewsListView
        articles={articlesResponse.items ?? []}
        reactionMap={reactionMap}
        savedMap={savedMap}
        userId={userId}
        role="tabpanel"
      />

      <div className="mt-6 flex items-center justify-between gap-3 text-sm font-semibold">
        {prevPage ? (
          <Link href={buildNewsPageHref({ page: prevPage, query, sort })}>
            ← Previous
          </Link>
        ) : (
          <span className="opacity-50">← Previous</span>
        )}

        {nextPage ? (
          <Link href={buildNewsPageHref({ page: nextPage, query, sort })}>
            Next →
          </Link>
        ) : (
          <span className="opacity-50">Next →</span>
        )}
      </div>
    </div>
  );
}