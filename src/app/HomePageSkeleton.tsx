import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonPageShell,
} from "@/components/AppSkeletons/AppSkeletons";

function SearchCardSkeleton() {
  return (
    <SkeletonCard>
      <SkeletonBlock className="h-5 w-40" />
      <SkeletonBlock className="mt-2 h-4 w-80 max-w-full" />
      <SkeletonBlock className="mt-4 h-11 w-full" />
      <SkeletonBlock className="mt-3 h-11 w-full" />
    </SkeletonCard>
  );
}

function TabSkeleton() {
  return (
    <div className="mb-4 w-full px-0 sm:px-1">
      <div
        className={[
          "fixed inset-x-0 bottom-0 z-50",
          "border-t border-[hsl(var(--border))]",
          "bg-[hsl(var(--tabs-surface))]",
          "pb-[env(safe-area-inset-bottom)] backdrop-blur",
          "lg:static lg:z-auto lg:border-t-0 lg:bg-transparent",
          "lg:pb-0 lg:backdrop-blur-none",
        ].join(" ")}
      >
        <div className="mx-auto w-full lg:max-w-3xl">
          <div
            className={[
              "grid w-full overflow-hidden",
              "bg-[hsl(var(--tabs-surface))]",
              "border-0 shadow-none",
              "lg:rounded-xl lg:border lg:border-[hsl(var(--border))]",
              "lg:shadow-sm",
              "[grid-template-columns:repeat(5,minmax(0,1fr))]",
            ].join(" ")}
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const isActive = i === 0;

              return (
                <div
                  key={i}
                  className={[
                    "relative flex min-h-14 min-w-0 items-center justify-center",
                    "border-r border-[hsl(var(--border))] px-1.5 py-1.5",
                    "last:border-r-0",
                    "lg:min-h-12 lg:px-3 lg:py-3",
                    isActive
                      ? "bg-[hsl(var(--primary)/0.1)] lg:bg-[hsl(var(--background))]"
                      : "bg-transparent",
                  ].join(" ")}
                >
                  <div className="flex min-w-0 max-w-full flex-col items-center justify-center gap-0.5 lg:flex-row lg:gap-2">
                    <SkeletonBlock className="h-4 w-4 shrink-0 rounded-md lg:h-[18px] lg:w-[18px]" />
                    <SkeletonBlock className="h-2.5 w-8 rounded-sm lg:h-4 lg:w-16 lg:rounded-md" />
                  </div>

                  <span
                    aria-hidden="true"
                    className={[
                      "absolute inset-x-0 top-0 h-0.5",
                      "bg-[hsl(var(--primary))]",
                      "lg:top-auto lg:bottom-0",
                      isActive ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleCardSkeleton() {
  return (
    <SkeletonCard>
      <div className="space-y-3 sm:flex sm:items-start sm:gap-4 sm:space-y-0">
        <SkeletonBlock className="h-40 w-full rounded-xl sm:h-32 sm:w-32 sm:shrink-0" />

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-5 w-20 rounded-full" />
            <SkeletonBlock className="h-3.5 w-16 rounded-md" />
          </div>

          <SkeletonBlock className="h-5 w-11/12 rounded-md" />
          <SkeletonBlock className="h-4 w-full rounded-md" />
          <SkeletonBlock className="h-4 w-4/5 rounded-md" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[hsl(var(--border))] pt-3">
        <SkeletonBlock className="h-8 min-w-10 rounded-lg" />
        <SkeletonBlock className="h-7 w-12 rounded-full" />
        <SkeletonBlock className="h-7 w-12 rounded-full" />
        <SkeletonBlock className="h-7 w-12 rounded-full" />
      </div>
    </SkeletonCard>
  );
}

function HomePanelSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-3 py-3 sm:px-5 sm:py-4">
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="h-5 w-28 rounded-md sm:h-6 sm:w-36" />
          <SkeletonBlock className="mt-2 hidden h-4 w-72 max-w-full rounded-md sm:block" />
        </div>

        <SkeletonBlock className="h-8 w-24 shrink-0 rounded-lg sm:h-9 sm:w-28" />
      </div>

      <div className="px-3 py-3 sm:px-5 sm:py-4">
        <SkeletonBlock className="mb-4 h-10 w-full rounded-xl" />

        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className="border-t border-[hsl(var(--border))] px-3 py-5 sm:px-5">
        <SkeletonBlock className="mx-auto h-10 w-full rounded-lg sm:w-32" />
      </div>
    </section>
  );
}

function HomeTabsSkeleton() {
  return (
    <div>
      <TabSkeleton />
      <HomePanelSkeleton />
    </div>
  );
}

export default function HomePageSkeleton() {
  return (
    <SkeletonPageShell>
      <div className="pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <SearchCardSkeleton />
        <HomeTabsSkeleton />
      </div>
    </SkeletonPageShell>
  );
}