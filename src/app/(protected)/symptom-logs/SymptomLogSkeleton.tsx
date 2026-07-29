// src/components/Skeletons/SymptomLogsPageSkeleton.tsx

import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonPageShell,
} from "@/components/AppSkeletons/AppSkeletons";

function SymptomLogRowSkeleton() {
  return (
    <SkeletonCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="h-6 w-16 rounded-full" />
          </div>

          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-4 w-64 max-w-full" />
          <SkeletonBlock className="h-4 w-4/5" />
        </div>

        <div className="flex shrink-0 gap-2">
          <SkeletonBlock className="h-9 w-20" />
          <SkeletonBlock className="h-9 w-24" />
        </div>
      </div>
    </SkeletonCard>
  );
}

export default function SymptomLogSkeleton() {
  return (
    <SkeletonPageShell>
      <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-5 py-4">
          <div>
            <SkeletonBlock className="h-7 w-40" />
            <SkeletonBlock className="mt-2 h-4 w-80 max-w-full" />
          </div>

          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-32" />
            <SkeletonBlock className="h-9 w-28" />
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-7 w-24 rounded-full" />
            <SkeletonBlock className="h-7 w-24 rounded-full" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SymptomLogRowSkeleton key={index} />
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