import Link from "next/link";
import { Suspense } from "react";
import { CLIENT_PATHS } from "@/config/paths";
import NewsTabs from "./NewsTabs";
import NewsResults from "./NewsResult";
import ListPanelSkeleton from "./ListPanelSkeleton";

import type { NewsSort } from "@/types/news";
import type { SavedItemsSort } from "@/types";
import { getCurrentUser } from "@/lib/helpers/getCurrentUser";

type SearchParams = Promise<{
  page?: string;
  s_news_page?: string;
  view?: string;
  query?: string;
  sort?: string;
  s_news_sort?: string;
}>;

function normalizeNewsSort(value?: string): NewsSort {
  return value === "oldest" || value === "popular" ? value : "latest";
}

function normalizeSavedSort(value?: string): SavedItemsSort {
  return value === "oldest" ? "oldest" : "newest";
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  const resolved = await searchParams;

  const view = resolved.view === "saved" ? "saved" : "all";
  const query = resolved.query?.trim() ?? "";

  const page = Math.max(1, Number(resolved.page ?? "1") || 1);
  const savedPage = Math.max(1, Number(resolved.s_news_page ?? "1") || 1);

  const sort = normalizeNewsSort(resolved.sort);
  const savedSort = normalizeSavedSort(resolved.s_news_sort);

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <main className="mx-auto max-w-5xl space-y-3 sm:space-y-6 px-2 py-2 sm:py-6">
        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2 sm:gap-5">
            <div>
              <h1 className="text-md font-bold sm:text-2xl">Health News</h1>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Browse recent medication, recall, and health-related stories.
              </p>
            </div>
          </div>

          <NewsTabs view={view} query={query} sort={sort} />

          <Suspense
            key={`${view}-${page}-${savedPage}-${query}-${sort}-${savedSort}`}
            fallback={<ListPanelSkeleton rows={6} />}
          >
            <NewsResults
              view={view}
              page={page}
              savedPage={savedPage}
              query={query}
              sort={sort}
              savedSort={savedSort}
              userId={user?.id}
            />
          </Suspense>
        </section>
      </main>
    </div>
  );
}