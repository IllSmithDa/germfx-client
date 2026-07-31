import { formatDrugName } from "@/lib/helpers/format_text";
import * as React from "react";

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  accentClass = "bg-[hsl(var(--muted-foreground)/0.2)]",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentClass?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 sm:px-4 py-3 sm:py-4 shadow-sm">
      {/* Top accent strip */}
      <div className={["absolute inset-x-0 top-0 h-0.5", accentClass].join(" ")} />

      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          {title}
        </p>
        {icon && (
          <div className="shrink-0 text-[hsl(var(--muted-foreground))] opacity-60">
            {icon}
          </div>
        )}
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>

      {subtitle && (
        <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">{subtitle}</p>
      )}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  icon,
  count,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-[hsl(var(--border))] px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="shrink-0 text-[hsl(var(--muted-foreground))]">{icon}</span>
          )}
          <div>
            <h2 className="text-sm font-semibold">{formatDrugName(title)}</h2>
            {description && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
            )}
          </div>
        </div>
        {count != null && count > 0 && (
          <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {count}
          </span>
        )}
      </div>
      <div className="px-2 sm:px-4 py-3 sm:py-4">{children}</div>
    </section>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] px-2 sm:px-4 py-3 sm:py-4 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
        <svg
          className="w-5 h-5 text-[hsl(var(--muted-foreground))]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
          <circle cx="12" cy="16" r="0.5" fill="currentColor" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[hsl(var(--foreground))]">No data yet</p>
      <p className="mt-1 max-w-[22ch] text-xs text-[hsl(var(--muted-foreground))]">{text}</p>
    </div>
  );
}
