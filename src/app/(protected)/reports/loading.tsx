// src/app/(protected)/reports/loading.tsx

import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonPageShell,
} from "@/components/AppSkeletons/AppSkeletons";

function ReportMetricSkeleton() {
  return (
    <SkeletonCard>
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="mt-3 h-8 w-20" />
      <SkeletonBlock className="mt-2 h-4 w-32" />
    </SkeletonCard>
  );
}

function ReportRowSkeleton() {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="h-4 w-56 max-w-full" />
        </div>
        <SkeletonBlock className="h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <SkeletonPageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <SkeletonBlock className="h-8 w-36" />
          <SkeletonBlock className="mt-2 h-4 w-96 max-w-full" />
          <SkeletonBlock className="mt-3 h-3 w-44" />
          <SkeletonBlock className="mt-2 h-3 w-40" />
        </div>

        <SkeletonBlock className="h-10 w-36" />
      </div>

      <SkeletonBlock className="mx-auto h-11 w-72 max-w-full rounded-t-xl" />

      <div className="grid gap-4 sm:grid-cols-3">
        <ReportMetricSkeleton />
        <ReportMetricSkeleton />
        <ReportMetricSkeleton />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <div className="border-b border-[hsl(var(--border))] px-5 py-4">
          <SkeletonBlock className="h-6 w-44" />
          <SkeletonBlock className="mt-2 h-4 w-80 max-w-full" />
        </div>

        <div className="space-y-3 px-5 py-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <ReportRowSkeleton key={index} />
          ))}
        </div>
      </section>
    </SkeletonPageShell>
  );
}