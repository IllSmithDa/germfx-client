/* eslint-disable @typescript-eslint/no-unused-vars */

import ContentReactionBar from "@/components/ContentReactionBar/ContentReactionBar";
import SaveRecallButton from "@/components/SaveRecallButton/SaveRecallButton";
import RecallFiltersPanel from "./RecallFiltersPanel";
import type { RecallItem, RecallSort } from "@/types/recalls";
import type {
  ReactionSummaryMap,
  SavedCheckMap,
} from "@/lib/server/bulkContentApi";


type RecallPanelProps = {
  items: RecallItem[];
  total?: number;
  title?: string;
  description?: string;
  emptyMessage?: string;
  sort?: RecallSort;
  source?: string;
  state?: string;
  reactionMap?: ReactionSummaryMap;
  savedMap?: SavedCheckMap;
};

function formatRecallDate(value?: string | null) {
  if (!value) return null;

  if (/^\d{8}$/.test(value)) {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);

    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return value;
}

function truncate(text?: string | null, max = 220) {
  if (!text) return null;
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

function sourceLabel(source?: string | null) {
  if (source === "food") return "Food Recall";
  if (source === "drug") return "Medication Recall";
  return "Recall";
}

function sourceTone(source?: string | null) {
  if (source === "food") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }
  if (source === "drug") {
    return "border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-400";
  }
  return "border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
}

function classificationTone(classification?: string | null) {
  const value = (classification || "").toLowerCase();

  if (value.includes("class i")) {
    return "border-rose-400/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";
  }
  if (value.includes("class ii")) {
    return "border-amber-400/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
  if (value.includes("class iii")) {
    return "border-slate-400/30 bg-slate-500/10 text-slate-600 dark:text-slate-300";
  }

  return "border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
}

function statusTone(status?: string | null) {
  const value = (status || "").toLowerCase();

  if (value.includes("ongoing")) {
    return "border-amber-400/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
  if (value.includes("terminated") || value.includes("completed")) {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }

  return "border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
}

function StatBadge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function RecallCard({
  item,
  reactionSummary,
  savedStatus
}: {
  item: RecallItem;
  reactionSummary?: ReactionSummaryMap[number];
  savedStatus?: SavedCheckMap[number]
}) {
  const displayDate = formatRecallDate(item.report_date || item.recall_date);

  return (
    <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 sm:p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <StatBadge className={sourceTone(item.source)}>
            {sourceLabel(item.source)}
          </StatBadge>

          {item.classification && (
            <StatBadge className={classificationTone(item.classification)}>
              {item.classification}
            </StatBadge>
          )}

          {item.status && (
            <StatBadge className={statusTone(item.status)}>
              {item.status}
            </StatBadge>
          )}
        </div>

        {displayDate && (
          <span className="self-start text-xs text-[hsl(var(--muted-foreground))] sm:shrink-0">
            {displayDate}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-3">
        <h3 className="text-sm sm:text-base font-semibold leading-6 text-[hsl(var(--foreground))]">
          {item.title}
        </h3>

        {item.reason && (
          <p className="text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            {truncate(item.reason, 260)}
          </p>
        )}

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          {item.company && (
            <div>
              <span className="font-medium text-[hsl(var(--foreground))]">
                Company:{" "}
              </span>
              <span className="text-[hsl(var(--muted-foreground))]">
                {item.company}
              </span>
            </div>
          )}

          {item.product_type && (
            <div>
              <span className="font-medium text-[hsl(var(--foreground))]">
                Type:{" "}
              </span>
              <span className="text-[hsl(var(--muted-foreground))]">
                {item.product_type}
              </span>
            </div>
          )}

          {item.recall_number && (
            <div>
              <span className="font-medium text-[hsl(var(--foreground))]">
                Recall #:{" "}
              </span>
              <span className="text-[hsl(var(--muted-foreground))]">
                {item.recall_number}
              </span>
            </div>
          )}

          {item.event_id && (
            <div>
              <span className="font-medium text-[hsl(var(--foreground))]">
                Event ID:{" "}
              </span>
              <span className="text-[hsl(var(--muted-foreground))]">
                {item.event_id}
              </span>
            </div>
          )}
        </div>

        {item.distribution && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Distribution
            </p>
            <p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              {truncate(item.distribution, 180)}
            </p>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SaveRecallButton
          recallId={item.id}
          initialSaved={savedStatus?.saved}
          initialSavedItemId={savedStatus?.saved_item_id}
        />
        <ContentReactionBar
          contentType="recall"
          sourceItemId={item.id}
          initialSummary={reactionSummary}
        />
      </div>
    </article>
  );
}

export default function RecallListView({
  items,
  emptyMessage = "No recent recalls were found.",
  sort = "latest",
  source = "all",
  state = "all",
  reactionMap,
  savedMap
}: RecallPanelProps) {
  const foodCount = items.filter((item) => item.source === "food").length;
  const drugCount = items.filter((item) => item.source === "drug").length;
  
  return (
    <section className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm overflow-hidden">
      <div className="border-b border-[hsl(var(--border))] px-3 py-3 sm:px-5 sm:py-4">
        <RecallFiltersPanel
          source={source}
          state={state}
          sort={sort}
        />
      </div>

      <div className="px-2 sm:px-4 py-3 sm:py-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <StatBadge className="border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
            {items.length} shown
          </StatBadge>

          <StatBadge className={sourceTone("food")}>
            {foodCount} food
          </StatBadge>

          <StatBadge className={sourceTone("drug")}>
            {drugCount} medication
          </StatBadge>
        </div>
        <p className="mb-3 flex items-start gap-1.5 px-1 text-xs text-[hsl(var(--muted-foreground))]">
          <svg
            className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="8" cy="8" r="6" />
            <line x1="8" y1="7" x2="8" y2="11" strokeLinecap="round" />
            <circle cx="8" cy="5.5" r="0.5" fill="currentColor" stroke="none" />
          </svg>
          Source: OpenFDA
        </p>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-4 py-6 text-sm text-[hsl(var(--muted-foreground))]">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <RecallCard
                key={`${item.source}-${item.id}`}
                item={item}
                reactionSummary={reactionMap?.[item.id]}
                savedStatus={savedMap?.[item.id]} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}