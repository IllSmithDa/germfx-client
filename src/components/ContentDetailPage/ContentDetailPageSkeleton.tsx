import { SkeletonBlock } from "@/components/AppSkeletons/AppSkeletons";

export type ContentDetailSkeletonType = "news" | "recall";

function NewsSkeleton() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <SkeletonBlock className="h-6 w-14 rounded-full" />
        <SkeletonBlock className="h-6 w-24 rounded-full" />
        <SkeletonBlock className="ml-auto h-3 w-24 rounded-md" />
      </div>

      <div className="mt-4 space-y-2">
        <SkeletonBlock className="h-7 w-full rounded-md sm:h-9" />
        <SkeletonBlock className="h-7 w-4/5 rounded-md sm:h-9" />
      </div>

      <SkeletonBlock className="mt-5 aspect-video w-full rounded-2xl" />

      <div className="mt-5">
        <SkeletonBlock className="h-4 w-20 rounded-md" />
        <div className="mt-3 space-y-2">
          <SkeletonBlock className="h-4 w-full rounded-md" />
          <SkeletonBlock className="h-4 w-full rounded-md" />
          <SkeletonBlock className="h-4 w-5/6 rounded-md" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[hsl(var(--border))] pt-4">
        <SkeletonBlock className="h-9 w-36 rounded-lg" />
        <SkeletonBlock className="h-8 w-12 rounded-full" />
        <SkeletonBlock className="h-8 w-12 rounded-full" />
        <SkeletonBlock className="h-8 w-12 rounded-full" />
      </div>
    </>
  );
}

function RecallSkeleton() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <SkeletonBlock className="h-6 w-24 rounded-full" />
        <SkeletonBlock className="h-6 w-16 rounded-full" />
        <SkeletonBlock className="h-6 w-20 rounded-full" />
        <SkeletonBlock className="ml-auto h-3 w-24 rounded-md" />
      </div>

      <div className="mt-4 space-y-2">
        <SkeletonBlock className="h-7 w-full rounded-md sm:h-9" />
        <SkeletonBlock className="h-7 w-3/4 rounded-md sm:h-9" />
      </div>

      <div className="mt-5">
        <SkeletonBlock className="h-4 w-28 rounded-md" />
        <div className="mt-3 space-y-2">
          <SkeletonBlock className="h-4 w-full rounded-md" />
          <SkeletonBlock className="h-4 w-full rounded-md" />
          <SkeletonBlock className="h-4 w-4/5 rounded-md" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/25 p-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <SkeletonBlock className="h-3 w-24 rounded-md" />
            <SkeletonBlock className="mt-2 h-4 w-36 max-w-full rounded-md" />
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/25 p-4">
        <SkeletonBlock className="h-3 w-24 rounded-md" />
        <div className="mt-3 space-y-2">
          <SkeletonBlock className="h-4 w-full rounded-md" />
          <SkeletonBlock className="h-4 w-11/12 rounded-md" />
          <SkeletonBlock className="h-4 w-3/4 rounded-md" />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-[hsl(var(--border))] pt-4">
        <SkeletonBlock className="h-8 w-12 rounded-full" />
        <SkeletonBlock className="h-8 w-12 rounded-full" />
        <SkeletonBlock className="h-8 w-12 rounded-full" />
      </div>

      <SkeletonBlock className="mt-5 h-3 w-28 rounded-md" />
    </>
  );
}

export default function ContentDetailPageSkeleton({
  contentType = "news",
}: {
  contentType?: ContentDetailSkeletonType;
}) {
  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <main className="mx-auto max-w-3xl px-2 py-4 sm:px-4 sm:py-8">
        <SkeletonBlock className="mb-4 h-4 w-32 rounded-md" />

        <article className="border-0 bg-transparent p-0 shadow-none sm:rounded-2xl sm:border sm:border-[hsl(var(--border))] sm:bg-[hsl(var(--card))] sm:p-6 sm:shadow-sm">
          {contentType === "news" ? <NewsSkeleton /> : <RecallSkeleton />}
        </article>
      </main>
    </div>
  );
}