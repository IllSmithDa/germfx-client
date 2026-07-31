import { ReactNode } from "react";
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "animate-pulse rounded-xl bg-[hsl(var(--muted))]",
        className,
      ].join(" ")}
    />
  );
}

export function SkeletonCard({ children }: { children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 sm:px-4 py-3 sm:py-4 shadow-sm">
      {children}
    </div>
  );
}

export function SkeletonPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <main className="mx-auto max-w-5xl sm:space-y-3 space-y-6 px-2 sm:px-4 py-3 sm:py-4">
        {children}
      </main>
    </div>
  );
}