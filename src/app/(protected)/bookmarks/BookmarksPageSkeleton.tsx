// src/components/Skeletons/BookmarksPageSkeleton.tsx

import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonPageShell,
} from "@/components/AppSkeletons/AppSkeletons";

function BookmarkRowSkeleton() {
  return (
    <SkeletonCard>
      <div className="space-y-3">
        <SkeletonBlock className="h-6 w-24 rounded-full" />
        <SkeletonBlock className="h-5 w-4/5" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-2/3" />

        <div className="flex gap-2 pt-1">
          <SkeletonBlock className="h-8 w-24" />
          <SkeletonBlock className="h-8 w-24" />
        </div>
      </div>
    </SkeletonCard>
  );
}

export function BookmarksTabPanelSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <BookmarkRowSkeleton key={index} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <SkeletonBlock className="h-9 w-24" />
        <SkeletonBlock className="h-5 w-24" />
        <SkeletonBlock className="h-9 w-20" />
      </div>
    </section>
  );
}

export default function BookmarksPageSkeleton() {
  return (
    <SkeletonPageShell>
      <div>
        <SkeletonBlock className="h-8 w-40" />
        <SkeletonBlock className="mt-2 h-4 w-96 max-w-full" />
      </div>

      <SkeletonBlock className="mx-auto h-11 w-72 max-w-full rounded-t-xl" />

      <BookmarksTabPanelSkeleton rows={6} />
    </SkeletonPageShell>
  );
}