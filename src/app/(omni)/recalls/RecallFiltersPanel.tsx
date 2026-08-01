"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useId, useState } from "react";

import RecallStateFilter from "@/components/RecallFilters/RecallStateFilter";
import RecallTypeFilter from "@/components/RecallFilters/RecallTypeFilter";
import type { RecallSort } from "@/types/recalls";
import RecallSortSelect from "./RecallSortSelect";

type RecallFiltersPanelProps = {
  source: string;
  state: string;
  sort: RecallSort;
};

function joinClasses(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ");
}

export default function RecallFiltersPanel({
  source,
  state,
  sort,
}: RecallFiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const generatedId = useId();
  const controlsId = `recall-filter-controls-${generatedId}`;

  const changedControlCount = [
    source !== "all",
    state !== "all",
    sort !== "latest",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">
            Browse recalls
          </h2>
          <p className="mt-1 hidden text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:block">
            Filter by recall type and state, then choose how results are sorted.
          </p>
        </div>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={controlsId}
          onClick={() => setIsOpen((current) => !current)}
          className={joinClasses(
            "inline-flex min-h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg",
            "border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5",
            "text-xs font-semibold text-[hsl(var(--foreground))] transition-colors",
            "hover:bg-[hsl(var(--muted))]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
            "sm:hidden",
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />

          <span>{isOpen ? "Hide filters" : "Show filters"}</span>

          {changedControlCount > 0 ? (
            <span className="rounded-full bg-[hsl(var(--primary))] px-1.5 py-0.5 text-[10px] leading-none text-[hsl(var(--primary-foreground))]">
              {changedControlCount}
            </span>
          ) : null}

          <ChevronDown
            className={joinClasses(
              "h-3.5 w-3.5 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      <div
        id={controlsId}
        className={joinClasses(
          isOpen ? "grid" : "hidden",
          "grid-cols-1 gap-3",
          "sm:grid sm:grid-cols-2",
          "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(10rem,0.75fr)]",
          "lg:items-end",
        )}
      >
        <div className="min-w-0 space-y-1.5 [&>*]:!w-full">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Recall type
          </p>
          <RecallTypeFilter value={source} />
        </div>

        <div className="min-w-0 space-y-1.5 [&>*]:!w-full">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            State
          </p>
          <RecallStateFilter value={state} />
        </div>

        <div className="min-w-0 space-y-1.5 sm:col-span-2 lg:col-span-1 [&>*]:!w-full">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Sort by
          </p>
          <RecallSortSelect value={sort} />
        </div>
      </div>
    </div>
  );
}