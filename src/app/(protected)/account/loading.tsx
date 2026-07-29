// src/app/(protected)/account/loading.tsx

import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonPageShell,
} from "@/components/AppSkeletons/AppSkeletons";

export default function Loading() {
  return (
    <SkeletonPageShell>
      <div>
        <SkeletonBlock className="h-8 w-40" />
        <SkeletonBlock className="mt-2 h-4 w-80 max-w-full" />
      </div>

      <SkeletonCard>
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-16 w-16 rounded-full" />

          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-4 w-56" />
          </div>
        </div>
      </SkeletonCard>

      <SkeletonCard>
        <SkeletonBlock className="h-5 w-36" />

        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-48" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-4 w-40" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-4 w-24" />
          </div>
        </div>
      </SkeletonCard>

      <SkeletonCard>
        <SkeletonBlock className="h-5 w-40" />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
        </div>
      </SkeletonCard>
    </SkeletonPageShell>
  );
}