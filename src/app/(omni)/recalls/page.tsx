import RecallTabs from "./RecallTabs";
import { fetchUserSettings } from "@/lib/server/fetchUserSettings";
import type { RecallSort } from "@/types/recalls";
import type { SavedItemsSort } from "@/types";
import { Suspense } from "react";
import { RecallsTabPanelSkeleton } from "./RecallsPageSkeleton";
import RecallResults from "./RecallResult";
import { getCurrentUser } from "@/lib/helpers/getCurrentUser";

type RecallPageProps = {
  searchParams?: Promise<{
    page?: string;
    s_recall_page?: string;
    query?: string;
    source?: string;
    view?: string;
    state?: string;
    sort?: string;
    s_recall_sort?: string;
  }>;
};

function normalizeRecallSort(value?: string): RecallSort {
  return value === "oldest" || value === "popular" ? value : "latest";
}

function normalizeSavedSort(value?: string): SavedItemsSort {
  return value === "oldest" ? "oldest" : "newest";
}

export default async function RecallsPage({ searchParams }: RecallPageProps) {
  const resolved = (await searchParams) ?? {};
  const userSettings = await fetchUserSettings();

  const view = resolved.view === "saved" ? "saved" : "all";
  const query = resolved.query?.trim() ?? "";

  const page = Math.max(1, Number(resolved.page ?? "1") || 1);
  const savedPage = Math.max(1, Number(resolved.s_recall_page ?? "1") || 1);

  const state =
    resolved.state?.trim() ??
    userSettings.default_recall_state ??
    "all";

  const source =
    resolved.source?.trim() ??
    userSettings.default_recall_type ??
    "all";

  const sort = normalizeRecallSort(resolved.sort);
  const savedSort = normalizeSavedSort(resolved.s_recall_sort);

  const user = await getCurrentUser();

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="mx-auto max-w-5xl space-y-3 sm:space-y-6 px-2 sm:px-4 py-2 sm:py-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Recall Updates</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Browse FDA food and medication recalls in a cleaner, searchable format.
          </p>
        </div>

        <RecallTabs
          view={view}
          query={query}
          source={source}
        />

        <Suspense
          key={`${view}-${page}-${savedPage}-${query}-${source}-${state}-${sort}-${savedSort}`}
          fallback={<RecallsTabPanelSkeleton rows={6} />}
        >
          <RecallResults
            view={view}
            page={page}
            savedPage={savedPage}
            query={query}
            source={source}
            state={state}
            sort={sort}
            savedSort={savedSort}
            userId={user?.id}
          />
        </Suspense>
      </div>
    </div>
  );
}