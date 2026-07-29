// src/app/(protected)/log-symptom/loading.tsx

import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonPageShell,
} from "@/components/AppSkeletons/AppSkeletons";

function FormFieldSkeleton({
  labelWidth = "w-28",
  inputHeight = "h-11",
}: {
  labelWidth?: string;
  inputHeight?: string;
}) {
  return (
    <div className="space-y-2">
      <SkeletonBlock className={`h-4 ${labelWidth}`} />
      <SkeletonBlock className={`${inputHeight} w-full`} />
    </div>
  );
}

export default function Loading() {
  return (
    <SkeletonPageShell>
      <div>
        <SkeletonBlock className="h-8 w-44" />
        <SkeletonBlock className="mt-2 h-4 w-96 max-w-full" />
      </div>

      <SkeletonCard>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldSkeleton labelWidth="w-20" />
            <FormFieldSkeleton labelWidth="w-32" />
          </div>

          <FormFieldSkeleton labelWidth="w-32" />

          <FormFieldSkeleton
            labelWidth="w-20"
            inputHeight="h-24"
          />

          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-24" />
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {Array.from({ length: 10 }).map((_, index) => (
                <SkeletonBlock
                  key={index}
                  className="h-10 w-full rounded-xl"
                />
              ))}
            </div>
          </div>

          <FormFieldSkeleton labelWidth="w-36" />

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <SkeletonBlock className="h-10 w-24" />
            <SkeletonBlock className="h-10 w-36" />
          </div>
        </div>
      </SkeletonCard>
    </SkeletonPageShell>
  );
}