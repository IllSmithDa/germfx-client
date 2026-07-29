// src/app/(protected)/drugs/[id]/loading.tsx

import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonPageShell,
} from "@/components/AppSkeletons/AppSkeletons";

function InfoPanelSkeleton({
  rows = 4,
}: {
  rows?: number;
}) {
  return (
    <SkeletonCard>
      <SkeletonBlock className="h-6 w-40" />
      <SkeletonBlock className="mt-2 h-4 w-72 max-w-full" />

      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="space-y-2">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
}

export default function Loading() {
  return (
    <SkeletonPageShell>
      <div>
        <SkeletonBlock className="h-8 w-64 max-w-full" />
        <SkeletonBlock className="mt-2 h-4 w-96 max-w-full" />

        <div className="mt-4 flex flex-wrap gap-2">
          <SkeletonBlock className="h-7 w-24 rounded-full" />
          <SkeletonBlock className="h-7 w-32 rounded-full" />
          <SkeletonBlock className="h-7 w-28 rounded-full" />
        </div>
      </div>

      <SkeletonCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-4 w-72 max-w-full" />
          </div>

          <SkeletonBlock className="h-10 w-36" />
        </div>
      </SkeletonCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoPanelSkeleton rows={3} />
        <InfoPanelSkeleton rows={3} />
      </div>

      <InfoPanelSkeleton rows={5} />

      <InfoPanelSkeleton rows={4} />
    </SkeletonPageShell>
  );
}