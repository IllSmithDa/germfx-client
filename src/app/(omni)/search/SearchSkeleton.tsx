// src/app/(protected)/search/SearchSkeleton.tsx

import { SkeletonBlock } from "@/components/AppSkeletons/AppSkeletons";

type SearchType = "all" | "recalls" | "news";

function SearchBarSkeleton() {
  return (
    <div className="mb-4">
      <div className="relative sm:flex sm:items-center sm:gap-2">
        <SkeletonBlock className="h-10 w-full rounded-xl sm:flex-1" />

        {/* Mobile inline search icon / desktop Search button */}
        <SkeletonBlock className="absolute right-1 top-1/2 size-8 -translate-y-1/2 rounded-lg sm:static sm:h-10 sm:w-20 sm:translate-y-0" />
      </div>
    </div>
  );
}

function SearchTabsSkeleton() {
  return (
    <>
      {/* SharedTabs normally adds this clearance to the body on mobile. */}
      <div className="h-0 lg:hidden" aria-hidden="true" />

      <div className="fixed inset-x-0 bottom-0 z-50 flex w-full border-t border-[hsl(var(--border))] bg-[hsl(var(--tabs-surface))] lg:static lg:z-auto lg:border-t-0 lg:bg-transparent">
        <div className="grid min-h-14 w-full grid-cols-3 overflow-hidden bg-[hsl(var(--tabs-surface))] shadow-none lg:min-h-12 lg:rounded-xl lg:border lg:border-[hsl(var(--border))] lg:shadow-sm">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="relative flex min-h-14 items-center justify-center border-r border-[hsl(var(--border))] px-1.5 py-1.5 last:border-r-0 lg:min-h-12 lg:px-3 lg:py-3"
            >
              {index === 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-0.5 bg-[hsl(var(--primary))] lg:bottom-0 lg:top-auto"
                />
              ) : null}

              <SkeletonBlock
                className={[
                  "h-3 rounded-md lg:h-4",
                  index === 1 ? "w-14" : "w-10",
                ].join(" ")}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function RecallResultRowSkeleton() {
  return (
    <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBlock className="h-6 w-16 rounded-full" />
          <SkeletonBlock className="h-6 w-20 rounded-full" />
          <SkeletonBlock className="h-6 w-16 rounded-full" />
        </div>

        <SkeletonBlock className="h-3 w-24 rounded-md" />
      </div>

      <div className="mt-3 space-y-2">
        <SkeletonBlock className="h-5 w-11/12 rounded-md" />
        <SkeletonBlock className="h-4 w-full rounded-md" />
        <SkeletonBlock className="h-4 w-5/6 rounded-md" />
        <SkeletonBlock className="h-4 w-3/4 rounded-md" />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <SkeletonBlock className="h-4 w-40 max-w-full rounded-md" />
        <SkeletonBlock className="h-4 w-36 max-w-full rounded-md" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SkeletonBlock className="h-8 w-20 rounded-lg" />
        <SkeletonBlock className="h-7 w-12 rounded-full" />
        <SkeletonBlock className="h-7 w-12 rounded-full" />
        <SkeletonBlock className="h-7 w-12 rounded-full" />
      </div>
    </article>
  );
}

function NewsResultRowSkeleton() {
  return (
    <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
        {/* Matches the current Search news image:
            full-width 16:9 on mobile, 10.5rem wide and vertically stretched on sm+. */}
        <SkeletonBlock className="aspect-video w-full shrink-0 rounded-xl sm:aspect-auto sm:min-h-[8rem] sm:w-[10.5rem] sm:self-stretch" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <SkeletonBlock className="h-6 w-14 rounded-full" />
              <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>

            <SkeletonBlock className="h-3 w-24 rounded-md" />
          </div>

          <div className="mt-3 space-y-2">
            <SkeletonBlock className="h-5 w-11/12 rounded-md" />
            <SkeletonBlock className="h-4 w-full rounded-md" />
            <SkeletonBlock className="h-4 w-5/6 rounded-md" />
            <SkeletonBlock className="h-4 w-2/3 rounded-md" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-8 w-24 rounded-lg" />
            <SkeletonBlock className="h-8 w-20 rounded-lg" />
            <SkeletonBlock className="h-7 w-12 rounded-full" />
            <SkeletonBlock className="h-7 w-12 rounded-full" />
            <SkeletonBlock className="h-7 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </article>
  );
}

function ResultGroupSkeleton({
  kind,
  rows,
  showHeading,
}: {
  kind: "recalls" | "news";
  rows: number;
  showHeading: boolean;
}) {
  return (
    <div className="space-y-3">
      {showHeading ? (
        <SkeletonBlock
          className={[
            "h-4 rounded-md",
            kind === "recalls" ? "w-16" : "w-12",
          ].join(" ")}
        />
      ) : null}

      {Array.from({ length: rows }).map((_, index) =>
        kind === "news" ? (
          <NewsResultRowSkeleton key={`news-${index}`} />
        ) : (
          <RecallResultRowSkeleton key={`recall-${index}`} />
        ),
      )}
    </div>
  );
}

export function SearchResultsSkeleton({
  rows = 6,
  type = "all",
}: {
  rows?: number;
  type?: SearchType;
}) {
  const safeRows = Math.max(1, rows);
  const recallRows =
    type === "all" ? Math.max(1, Math.ceil(safeRows / 2)) : safeRows;
  const newsRows =
    type === "all" ? Math.max(1, Math.floor(safeRows / 2)) : safeRows;

  return (
    <section className="border-0 bg-transparent p-0 shadow-none sm:rounded-2xl sm:border sm:border-[hsl(var(--border))] sm:bg-[hsl(var(--card))] sm:p-5 sm:shadow-sm">
      <div className="mb-5">
        <SkeletonBlock className="h-5 w-48 rounded-md sm:h-6" />
        <SkeletonBlock className="mt-2 h-4 w-32 rounded-md" />
      </div>

      <div className="space-y-4">
        {type === "all" || type === "recalls" ? (
          <ResultGroupSkeleton
            kind="recalls"
            rows={recallRows}
            showHeading={type === "all"}
          />
        ) : null}

        {type === "all" || type === "news" ? (
          <ResultGroupSkeleton
            kind="news"
            rows={newsRows}
            showHeading={type === "all"}
          />
        ) : null}
      </div>
    </section>
  );
}

export default function SearchPageSkeleton() {
  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <main className="mx-auto max-w-2xl space-y-6 px-2 py-6 pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:max-w-5xl sm:px-4 sm:py-10 lg:pb-10">
        <div>
          <SkeletonBlock className="h-5 w-36 rounded-md sm:h-9 sm:w-48" />
          <SkeletonBlock className="mt-2 h-4 w-80 max-w-full rounded-md" />
        </div>

        <SearchBarSkeleton />
        <SearchTabsSkeleton />
        <SearchResultsSkeleton rows={6} type="all" />
      </main>
    </div>
  );
}