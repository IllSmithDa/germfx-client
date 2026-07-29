/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo, useState } from "react";

type SideEffectItem = {
  name: string;
  description: string;
};

type ClassifiedSideEffects = {
  common_or_likely: string[];
  possible: string[];
  serious: string[];
  all: string[];
};

type ClassifiedDescribedSideEffects = {
  common_or_likely: SideEffectItem[];
  possible: SideEffectItem[];
  serious: SideEffectItem[];
  all: SideEffectItem[];
};

type Props = {
  sideEffects: string[];
  classified?: ClassifiedSideEffects;
  classifiedDescribed?: ClassifiedDescribedSideEffects;
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

function dedupeDescribed(items: SideEffectItem[]) {
  const out: SideEffectItem[] = [];
  const seen = new Set<string>();

  for (const item of items || []) {
    const name = String(item?.name || "").trim();
    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    out.push({
      name,
      description: String(
        item?.description || "A reported reaction mentioned in the drug label.",
      ).trim(),
    });
  }

  return out;
}

function toLabel(value: string) {
  return value.replace(/\b\w/g, (m) => m.toUpperCase());
}

const SideEffectsIcon = () => (
  <svg
    className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M5 8c0-1.66 1.34-3 3-3s3 1.34 3 3" />
    <line x1="8" y1="8" x2="8" y2="11" strokeLinecap="round" />
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

function EffectPills({
  items,
  tone = "default",
  selectedName,
  onSelect,
}: {
  items: SideEffectItem[];
  tone?: "default" | "serious" | "secondary";
  selectedName?: string | null;
  onSelect: (item: SideEffectItem) => void;
}) {
  const styles =
    tone === "serious"
      ? {
          base:
            "border-rose-900 bg-rose-200 text-rose-950 shadow-sm hover:bg-rose-300 dark:border-rose-300 dark:bg-rose-700 dark:text-rose-50 dark:hover:bg-rose-600",
          selected: "bg-rose-300 ring-2 ring-rose-900/30 dark:bg-rose-500",
        }
      : tone === "secondary"
      ? {
          base:
            "border-slate-900 bg-slate-300 text-black shadow-sm hover:bg-slate-400 dark:border-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600",
          selected:
            "bg-slate-400 ring-2 ring-slate-900/30 dark:bg-slate-500",
        }
      : {
          base:
            "border-amber-900 bg-amber-200 text-amber-950 shadow-sm hover:bg-amber-300 dark:border-amber-300 dark:bg-amber-700 dark:text-amber-50 dark:hover:bg-amber-600",
          selected:
            "bg-amber-300 ring-2 ring-amber-900/30 dark:bg-amber-500",
        };

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((effect) => {
        const isSelected =
          selectedName?.toLowerCase() === effect.name.toLowerCase();

        return (
          <button
            key={effect.name}
            type="button"
            onClick={() => onSelect(effect)}
            className={[
              "min-h-8 cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all hover:-translate-y-[1px] sm:text-sm",
              styles.base,
              isSelected ? styles.selected : "",
            ].join(" ")}
          >
            {toLabel(effect.name)}
          </button>
        );
      })}
    </div>
  );
}

function EffectGroup({
  title,
  items,
  tone = "default",
  description,
  selectedName,
  onSelect,
}: {
  title: string;
  items: SideEffectItem[];
  tone?: "default" | "serious" | "secondary";
  description?: string;
  selectedName?: string | null;
  onSelect: (item: SideEffectItem) => void;
}) {
  if (!items.length) return null;

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        ) : null}
      </div>

      <EffectPills
        items={items}
        tone={tone}
        selectedName={selectedName}
        onSelect={onSelect}
      />
    </div>
  );
}

function SelectedEffectCard({ item }: { item: SideEffectItem | null }) {
  if (!item) return null;

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-3 py-3 sm:px-4">
      <div className="text-sm font-semibold">{toLabel(item.name)}</div>
      <p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
        {item.description}
      </p>
    </div>
  );
}

export default function SideEffectsPanel({
  sideEffects,
  classified,
  classifiedDescribed,
}: Props) {
  const fallbackItems = useMemo(
    () =>
      dedupe(sideEffects || []).map((name) => ({
        name,
        description: "A reported reaction mentioned in the drug label.",
      })),
    [sideEffects],
  );

  const common = dedupeDescribed(classifiedDescribed?.common_or_likely || []);
  const reported = dedupeDescribed(classifiedDescribed?.possible || []);
  const serious = dedupeDescribed(classifiedDescribed?.serious || []);

  const hasDescribed = common.length > 0 || reported.length > 0 || serious.length > 0;

  const totalCount = hasDescribed
    ? dedupe([
        ...common.map((x) => x.name),
        ...reported.map((x) => x.name),
        ...serious.map((x) => x.name),
      ]).length
    : fallbackItems.length;

  const initialSelected =
    serious[0] ?? common[0] ?? reported[0] ?? fallbackItems[0] ?? null;

  const [selectedEffect, setSelectedEffect] =
    useState<SideEffectItem | null>(initialSelected);

  return (
    <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <SectionHeader
        icon={<SideEffectsIcon />}
        title="Reported Side Effects"
        count={totalCount}
      />

      <div className="space-y-4 px-3 py-3 sm:space-y-5 sm:px-5 sm:py-4">
        {hasDescribed ? (
          <>
            <EffectGroup
              title="Serious — Get Medical Help"
              items={serious}
              tone="serious"
              description="These may signal more serious reactions and may require prompt medical attention."
              selectedName={selectedEffect?.name}
              onSelect={setSelectedEffect}
            />

            <EffectGroup
              title="Common or Likely"
              items={common}
              tone="default"
              description="Frequently reflected in adverse reaction or label text."
              selectedName={selectedEffect?.name}
              onSelect={setSelectedEffect}
            />

            <EffectGroup
              title="Other Reported Reactions"
              items={reported}
              tone="secondary"
              description="Also mentioned in the drug label or warning text."
              selectedName={selectedEffect?.name}
              onSelect={setSelectedEffect}
            />

            <SelectedEffectCard item={selectedEffect} />
          </>
        ) : fallbackItems.length > 0 ? (
          <>
            <p className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-3 py-2 text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:text-sm sm:leading-6">
              These reactions are mentioned in the FDA label text. They are not ranked by likelihood unless categorized above.
            </p>
            <EffectPills
              items={fallbackItems}
              tone="default"
              selectedName={selectedEffect?.name}
              onSelect={setSelectedEffect}
            />
            <SelectedEffectCard item={selectedEffect} />
          </>
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Not available.
          </p>
        )}
      </div>
    </section>
  );
}