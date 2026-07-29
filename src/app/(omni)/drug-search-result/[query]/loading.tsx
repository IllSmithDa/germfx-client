// src/app/(protected)/drug-search/loading.tsx

import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonPageShell,
} from "@/components/AppSkeletons/AppSkeletons";

function DrugResultSkeleton() {
  return (
    <SkeletonCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-5 w-48" />
            <SkeletonBlock className="h-6 w-20 rounded-full" />
          </div>

          <SkeletonBlock className="h-4 w-72 max-w-full" />
          <SkeletonBlock className="h-4 w-4/5" />

          <div className="flex flex-wrap gap-2 pt-1">
            <SkeletonBlock className="h-7 w-24 rounded-full" />
            <SkeletonBlock className="h-7 w-28 rounded-full" />
            <SkeletonBlock className="h-7 w-20 rounded-full" />
          </div>
        </div>

        <SkeletonBlock className="h-9 w-28 shrink-0" />
      </div>
    </SkeletonCard>
  );
}

export default function Loading() {
  return (
    <SkeletonPageShell>
      <div>
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="mt-2 h-4 w-96 max-w-full" />
      </div>

      <SkeletonCard>
        <SkeletonBlock className="h-11 w-full" />
        <div className="mt-4 flex flex-wrap gap-2">
          <SkeletonBlock className="h-9 w-28" />
          <SkeletonBlock className="h-9 w-24" />
        </div>
      </SkeletonCard>

      <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <div className="border-b border-[hsl(var(--border))] px-5 py-4">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="mt-2 h-4 w-72 max-w-full" />
        </div>

        <div className="space-y-3 px-5 py-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <DrugResultSkeleton key={index} />
          ))}
        </div>
      </section>
    </SkeletonPageShell>
  );
}