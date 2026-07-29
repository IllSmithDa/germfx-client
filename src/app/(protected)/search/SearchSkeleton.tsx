// src/app/(protected)/search/SearchSkeleton.tsx

import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonPageShell,
} from "@/components/AppSkeletons/AppSkeletons";

function SearchResultRowSkeleton() {
  return (
    <SkeletonCard>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBlock className="h-6 w-20 rounded-full" />
          <SkeletonBlock className="h-4 w-28" />
        </div>

        <SkeletonBlock className="h-5 w-4/5" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-2/3" />

        <SkeletonBlock className="h-8 w-28" />
      </div>
    </SkeletonCard>
  );
}

export function SearchResultsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-5">
      <SkeletonBlock className="mx-auto h-11 w-80 max-w-full rounded-t-xl" />

      <SkeletonCard>
        <SkeletonBlock className="h-11 w-full" />
      </SkeletonCard>

      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm sm:p-5">
        <div className="mb-5">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="mt-2 h-4 w-72 max-w-full" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <SearchResultRowSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function SearchPageSkeleton() {
  return (
    <SkeletonPageShell>
      <div>
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="mt-2 h-4 w-96 max-w-full" />
      </div>

      <SearchResultsSkeleton rows={6} />
    </SkeletonPageShell>
  );
}