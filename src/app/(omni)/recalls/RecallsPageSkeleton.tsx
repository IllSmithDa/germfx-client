// src/components/Skeletons/RecallsPageSkeleton.tsx

import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonPageShell,
} from "@/components/AppSkeletons/AppSkeletons";

function RecallSkeleton() {
  return (
    <SkeletonCard>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBlock className="h-6 w-20 rounded-full" />
          <SkeletonBlock className="h-6 w-24 rounded-full" />
          <SkeletonBlock className="h-6 w-16 rounded-full" />
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
    </SkeletonCard>
  );
}

export default function RecallsPageSkeleton() {
  return (
    <SkeletonPageShell>
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-44" />
        <SkeletonBlock className="h-4 w-96 max-w-full" />
      </div>

      <SkeletonBlock className="mx-auto h-11 w-72 max-w-full rounded-t-xl" />

      <div className="flex flex-wrap gap-4">
        <SkeletonBlock className="h-10 w-40" />
        <SkeletonBlock className="h-10 w-40" />
      </div>

      <RecallsTabPanelSkeleton rows={6} />
    </SkeletonPageShell>
  );
}

export function RecallsTabPanelSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-5 py-4">
          <div>
            <SkeletonBlock className="h-6 w-36" />
            <SkeletonBlock className="mt-2 h-4 w-72 max-w-full" />
          </div>

          <SkeletonBlock className="h-9 w-32" />
        </div>

        <div className="space-y-3 px-5 py-4">
          {Array.from({ length: rows }).map((_, index) => (
            <RecallSkeleton key={index} />
          ))}
        </div>
      </section>

      <SkeletonBlock className="h-14 w-full rounded-2xl" />
    </div>
  );
}