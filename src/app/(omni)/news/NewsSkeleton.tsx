// src/components/Skeletons/NewsPageSkeleton.tsx

import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonPageShell,
} from "@/components/AppSkeletons/AppSkeletons";

function NewsRowSkeleton() {
  return (
    <SkeletonCard>
      <div className="flex gap-3">
        <SkeletonBlock className="h-11 w-11 shrink-0" />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-5 w-24 rounded-full" />
            <SkeletonBlock className="h-4 w-20" />
          </div>

          <SkeletonBlock className="h-5 w-4/5" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-2/3" />

          <div className="flex flex-wrap gap-2 pt-1">
            <SkeletonBlock className="h-8 w-24" />
            <SkeletonBlock className="h-8 w-24" />
            <SkeletonBlock className="h-8 w-32" />
          </div>
        </div>
      </div>
    </SkeletonCard>
  );
}

export default function NewsSkeleton() {
  return (
    <SkeletonPageShell>
      <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <div className="border-b border-[hsl(var(--border))] px-5 py-4">
          <SkeletonBlock className="h-7 w-36" />
          <SkeletonBlock className="mt-2 h-4 w-80 max-w-full" />
        </div>

        <div className="px-5 py-4">
          <div className="mb-5">
            <SkeletonBlock className="h-11 w-full" />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-9 w-28" />
            <SkeletonBlock className="h-7 w-20 rounded-full" />
            <SkeletonBlock className="h-7 w-24 rounded-full" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <NewsRowSkeleton key={index} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <SkeletonBlock className="h-9 w-24" />
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonBlock className="h-9 w-20" />
          </div>
        </div>
      </section>
    </SkeletonPageShell>
  );
}