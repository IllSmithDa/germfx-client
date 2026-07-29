// src/components/Skeletons/ListPanelSkeleton.tsx

import { SkeletonBlock, SkeletonCard } from "@/components/AppSkeletons/AppSkeletons";

export default function ListPanelSkeleton({
  rows = 5,
}: {
  rows?: number;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonCard key={index}>
          <div className="flex gap-3">
            <SkeletonBlock className="h-11 w-11 shrink-0" />
            <div className="min-w-0 flex-1 space-y-3">
              <SkeletonBlock className="h-5 w-4/5" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-2/3" />
              <div className="flex gap-2 pt-1">
                <SkeletonBlock className="h-8 w-24" />
                <SkeletonBlock className="h-8 w-24" />
              </div>
            </div>
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}