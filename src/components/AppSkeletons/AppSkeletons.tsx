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
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
      {children}
    </div>
  );
}

export function SkeletonPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}