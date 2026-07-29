"use client";

import { SafetyWarningItem } from "@/lib/server/fetchSafetyWarning";
import { useMemo, useState } from "react";

type Props = {
  items: SafetyWarningItem[];
};

function dedupe(items: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const item of items || []) {
    const value = String(item || "").trim();
    if (!value) continue;

    const key = value.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    out.push(value);
  }

  return out;
}

function toLabel(value: string) {
  return value.replace(/\b\w/g, (m) => m.toUpperCase());
}

const WarningIcon = () => (
  <svg
    className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path d="M8 2.5 13 12.5H3L8 2.5Z" />
    <line x1="8" y1="6" x2="8" y2="9" strokeLinecap="round" />
    <circle cx="8" cy="11" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[hsl(var(--border))] px-3 py-3 sm:px-5 sm:py-3.5">
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <h2 className="min-w-0 truncate text-sm font-semibold">{title}</h2>
      </div>

      {count != null && count > 0 && (
        <span className="shrink-0 rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
          {count}
        </span>
      )}
    </div>
  );
}

function WarningPill({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "min-h-8 cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all hover:-translate-y-[1px] sm:text-sm",
        "border-amber-900 bg-amber-200 text-amber-950 shadow-sm hover:bg-amber-300 dark:border-amber-300 dark:bg-amber-700 dark:text-amber-50 dark:hover:bg-amber-600",
        isSelected ? "bg-amber-300 ring-2 ring-amber-900/30 dark:bg-amber-500" : "",
      ].join(" ")}
    >
      {toLabel(label)}
    </button>
  );
}

function WarningCard({ item }: { item: SafetyWarningItem | null }) {
  if (!item) return null;

  return (
    <div className="space-y-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-3 py-3 sm:px-4 sm:py-4">
      <div>
        <h3 className="text-sm font-semibold">{item.title}</h3>
        {item.matched_terms.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
            {item.matched_terms.map((term) => (
              <span
                key={term}
                className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))] sm:px-2.5 sm:py-1"
              >
                {toLabel(term)}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {item.excerpts.length > 0 ? (
        <div className="space-y-2">
          {item.excerpts.map((excerpt, index) => (
            <p
              key={`${item.key}-${index}`}
              className="text-sm leading-6 text-[hsl(var(--muted-foreground))]"
            >
              {excerpt}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          No warning excerpt available.
        </p>
      )}
    </div>
  );
}

export default function SafetyWarningsPanel({ items }: Props) {
  const normalized = useMemo(
    () =>
      (items || [])
        .filter((item) => item?.key && item?.title)
        .map((item) => ({
          ...item,
          matched_terms: dedupe(item.matched_terms || []),
          excerpts: dedupe(item.excerpts || []),
        })),
    [items],
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(
    normalized[0]?.key ?? null,
  );

  const selectedItem =
    normalized.find((item) => item.key === selectedKey) ?? normalized[0] ?? null;

  return (
    <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <SectionHeader
        icon={<WarningIcon />}
        title="Safety Warning Highlights"
        count={normalized.length}
      />

      <div className="space-y-4 px-3 py-3 sm:px-5 sm:py-4">
        {normalized.length > 0 ? (
          <>
            <p className="rounded-xl border border-amber-400/20 bg-amber-500/5 px-3 py-2 text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:text-sm sm:leading-6">
              Important warning themes extracted from the FDA label. Review the full label warnings below for source wording.
            </p>

            <div className="flex flex-wrap gap-2">
              {normalized.map((item) => (
                <WarningPill
                  key={item.key}
                  label={item.title}
                  isSelected={selectedItem?.key === item.key}
                  onClick={() => setSelectedKey(item.key)}
                />
              ))}
            </div>

            <WarningCard item={selectedItem} />
          </>
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No structured warning highlights available.
          </p>
        )}
      </div>
    </section>
  );
}