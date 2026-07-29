import Link from "next/link";

import { fetchRecalls } from "@/lib/server/recallsApi";
import { fetchSavedItems } from "@/lib/server/fetchSavedItems";


import RecallPagination from "./RecallPagination";
import RecallListView from "./RecallListView";
import SavedRecalls from "@/components/SavedItems/SavedRecalls";
import UsageLimitNotice from "@/components/UsageLimitNotice/UsageLimitNotice";

import type { RecallSort } from "@/types/recalls";
import type { SavedItemsSort } from "@/types";

import {
  fetchBulkReactionSummaries,
  fetchBulkSavedChecks,
} from "@/lib/server/bulkContentApi";
import { fetchUsageLimitStatus } from "@/lib/server/fetchLimitUsageStatus";

const PAGE_SIZE = 10;

function buildSavedRecallHref({
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

  return `/recalls${qs ? `?${qs}` : ""}`;
}

function SavedRecallsLoginRequired({
  query,
  savedPage,
  savedSort,
}: {
  query: string;
  savedPage: number;
  savedSort: SavedItemsSort;
}) {
  const nextHref = buildSavedRecallHref({
    savedPage,
    query,
    savedSort,
  });

  const loginHref = `/login?next=${encodeURIComponent(nextHref)}`;

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
        Log in to view saved recalls
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-[hsl(var(--muted-foreground))]">
        Saved recalls are tied to your account. Log in to view and manage your
        saved news and recall items.
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

export default async function RecallResults({
  view,
  page,
  savedPage,
  query,
  source,
  state,
  sort,
  savedSort,
  userId,
}: {
  view: "all" | "saved";
  page: number;
  savedPage: number;
  query: string;
  source: string;
  state: string;
  sort: RecallSort;
  savedSort: SavedItemsSort;
  userId?: number | string | null;
}) {
  const isLoggedIn = userId !== null && userId !== undefined;

  if (view === "saved") {
    if (!isLoggedIn) {
      return (
        <SavedRecallsLoginRequired
          query={query}
          savedPage={savedPage}
          savedSort={savedSort}
        />
      );
    }

    const safeSavedPage = Math.max(1, savedPage);
    const skip = (safeSavedPage - 1) * PAGE_SIZE;

    const [savedRecalls, savedItemsUsageStatus] = await Promise.all([
      fetchSavedItems({
        content_type: "recall",
        query: query || undefined,
        limit: PAGE_SIZE,
        skip,
        sort: savedSort,
      }),
      fetchUsageLimitStatus("saved_items"),
    ]);

    const totalPages = Math.max(
      1,
      Math.ceil((savedRecalls.total ?? 0) / PAGE_SIZE),
    );

    const finalSavedPage = Math.min(safeSavedPage, totalPages);

    return (
      <div className="space-y-4">
        <UsageLimitNotice
          featureKey="saved_items"
          status={savedItemsUsageStatus}
        />

        <SavedRecalls
          recalls={savedRecalls}
          currentPage={finalSavedPage}
          query={query}
          newsQuery=""
          pageSize={PAGE_SIZE}
          sort={savedSort}
          newsSort="newest"
          baseUrl="/recalls"
        />
      </div>
    );
  }

  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * PAGE_SIZE;

  const recalls = await fetchRecalls({
    limit: PAGE_SIZE,
    skip,
    query: query || undefined,
    source: source !== "all" ? source : undefined,
    state: state !== "all" ? state : undefined,
    sort,
    sync_if_needed: true,
  });

  const totalPages = Math.max(
    1,
    Math.ceil((recalls.total ?? 0) / PAGE_SIZE),
  );

  const finalPage = Math.min(safePage, totalPages);
  const recallIds = recalls.items?.map((item) => item.id) ?? [];

  const [reactionMap, savedMap, savedItemsUsageStatus] = await Promise.all([
    recallIds.length
      ? fetchBulkReactionSummaries("recall", recallIds)
      : Promise.resolve({}),

    isLoggedIn && recallIds.length
      ? fetchBulkSavedChecks("recall", recallIds)
      : Promise.resolve({}),

    isLoggedIn
      ? fetchUsageLimitStatus("saved_items")
      : Promise.resolve(null),
  ]);

  return (
    <>
      <UsageLimitNotice
        featureKey="saved_items"
        status={savedItemsUsageStatus}
      />
      <RecallListView
        source={source}
        state={state}
        items={recalls.items ?? []}
        reactionMap={reactionMap}
        savedMap={savedMap}
        total={recalls.total}
        title="Recent Recalls"
        sort={sort}
        description={
          query
            ? `Showing results for "${query}".`
            : "Recent FDA food and medication recalls."
        }
        emptyMessage="No recalls matched your search."
      />

      <RecallPagination
        currentPage={finalPage}
        totalPages={totalPages}
        query={query}
        source={source}
        state={state}
        view={view}
        sort={sort}
      />
    </>
  );
}