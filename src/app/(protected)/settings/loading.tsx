// src/app/(protected)/settings/loading.tsx

import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonPageShell,
} from "@/components/AppSkeletons/AppSkeletons";

function SettingsRowSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <SkeletonBlock className="h-5 w-40" />
        <SkeletonBlock className="h-4 w-72 max-w-full" />
      </div>

      <SkeletonBlock className="h-10 w-44 shrink-0" />
    </div>
  );
}

function SettingsSectionSkeleton({
  titleWidth = "w-40",
  rows = 3,
}: {
  titleWidth?: string;
  rows?: number;
}) {
  return (
    <SkeletonCard>
      <div className="space-y-2">
        <SkeletonBlock className={`h-6 ${titleWidth}`} />
        <SkeletonBlock className="h-4 w-80 max-w-full" />
      </div>

      <div className="mt-5 divide-y divide-[hsl(var(--border))]">
        {Array.from({ length: rows }).map((_, index) => (
          <SettingsRowSkeleton key={index} />
        ))}
      </div>
    </SkeletonCard>
  );
}

export default function Loading() {
  return (
    <SkeletonPageShell>
      <div>
        <SkeletonBlock className="h-8 w-36" />
        <SkeletonBlock className="mt-2 h-4 w-96 max-w-full" />
      </div>

      <div className="space-y-6">
        <SettingsSectionSkeleton
          titleWidth="w-44"
          rows={2}
        />

        <SettingsSectionSkeleton
          titleWidth="w-48"
          rows={3}
        />

        <SettingsSectionSkeleton
          titleWidth="w-52"
          rows={2}
        />

        <SettingsSectionSkeleton
          titleWidth="w-44"
          rows={2}
        />

        <SkeletonCard>
          <div className="space-y-2">
            <SkeletonBlock className="h-6 w-36" />
            <SkeletonBlock className="h-4 w-72 max-w-full" />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <SkeletonBlock className="h-10 w-36" />
            <SkeletonBlock className="h-10 w-32" />
          </div>
        </SkeletonCard>
      </div>
    </SkeletonPageShell>
  );
}