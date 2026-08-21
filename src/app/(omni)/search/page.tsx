import { Suspense } from "react";
import SearchResults from "./SearchResults";
import { SearchResultsSkeleton } from "./SearchSkeleton";
import { SearchForm } from "./SearchForm";
import SearchTabs from "./SearchTabs";
import { limitQueryText } from "@/lib/helpers/queryText";

type SearchPageProps = {
  searchParams?: Promise<{
    query?: string;
    type?: string;
    page?: string;
  }>;
};

type SearchType = "all" | "recalls" | "news";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = (await searchParams) ?? {};

  const query = limitQueryText(resolved.query?.trim() ?? "", 100)
  const type: SearchType =
    resolved.type === "recalls" || resolved.type === "news"
      ? resolved.type
      : "all";

  const page = Math.max(1, Number(resolved.page ?? "1") || 1);

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <main className="mx-auto max-w-2xl sm:max-w-5xl space-y-6 px-2 py-6 sm:px-4 sm:py-10">
        <div>
          <h1 className="text-md font-bold sm:text-3xl">Search GermFx</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Search health news and FDA recall updates in one place.
          </p>
        </div>
        <SearchForm query={query} type={type} />

        <SearchTabs
          query={query}
          activeType={type}
        />

        <Suspense
          key={`${query}-${type}-${page}`}
          fallback={<SearchResultsSkeleton rows={6} />}
        >
          <SearchResults query={query} type={type} page={page} />
        </Suspense>
      </main>
    </div>
  );
}