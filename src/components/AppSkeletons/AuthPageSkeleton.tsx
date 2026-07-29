// src/components/Skeletons/AuthPageSkeleton.tsx

import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonPageShell,
} from "@/components/AppSkeletons/AppSkeletons";

export default function AuthPageSkeleton({
  mode = "login",
}: {
  mode?: "login" | "register";
}) {
  const fieldCount = mode === "register" ? 4 : 2;

  return (
    <SkeletonPageShell>
      <div className="mx-auto w-full max-w-md">
        <SkeletonCard>
          <div className="mb-6 text-center">
            <SkeletonBlock className="mx-auto h-8 w-40" />
            <SkeletonBlock className="mx-auto mt-2 h-4 w-64 max-w-full" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: fieldCount }).map((_, index) => (
              <div key={index}>
                <SkeletonBlock className="mb-2 h-4 w-24" />
                <SkeletonBlock className="h-11 w-full" />
              </div>
            ))}

            <SkeletonBlock className="h-11 w-full" />

            <div className="flex justify-center">
              <SkeletonBlock className="h-4 w-56" />
            </div>
          </div>
        </SkeletonCard>
      </div>
    </SkeletonPageShell>
  );
}