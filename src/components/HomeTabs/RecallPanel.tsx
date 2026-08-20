/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link";
import { CLIENT_PATHS } from "@/config/paths";
import type { RecallItem } from "@/types/recalls";
import SaveRecallButton from "../SaveRecallButton/SaveRecallButton";
import ContentSearchBar from "../ContentSearchBar/ContentSearchBar";
import ContentReactionBar from "../ContentReactionBar/ContentReactionBar";
import { ReactionSummaryMap, SavedCheckMap } from "@/lib/server/bulkContentApi";
import { ReactionSummary } from "@/lib/client/reactionApi";
import UsageLimitNotice, {
  UsageLimitStatus,
} from "../UsageLimitNotice/UsageLimitNotice";

type RecallPanelProps = {
  items: RecallItem[];
  total?: number;
  savedMap?: SavedCheckMap;
  reactionMap?: ReactionSummaryMap;
  title?: string;
  description?: string;
  emptyMessage?: string;
  userId?: number | string | null;
  savedItemsUsageStatus?: UsageLimitStatus | null;
};

function formatRecallDate(value?: string | null) {
  if (!value) return null;

  // OpenFDA usually returns YYYYMMDD
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
        "inline-flex min-h-6 max-w-full items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none sm:px-2.5 sm:py-1 sm:text-[11px]",
        className,
      ].join(" ")}
    >
      <span className="truncate">{children}</span>
    </span>
  );
}

function RecallCard({
  item,
  savedStatus,
  reactionSummary,
  userId,
}: {
  item: RecallItem;
  savedStatus?: { saved: boolean; saved_item_id: number | null };
  reactionSummary?: ReactionSummary;
  userId?: number | string | null;
}) {
  const displayDate = formatRecallDate(item.report_date || item.recall_date);

  return (
    <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
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
          <span className="shrink-0 text-[11px] font-medium text-[hsl(var(--muted-foreground))] sm:text-xs">
            {displayDate}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2.5 sm:space-y-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[hsl(var(--foreground))] sm:text-base sm:leading-6">
          {item.title}
        </h3>

        {item.reason && (
          <p className="line-clamp-3 text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:text-sm sm:leading-6">
            {truncate(item.reason, 260)}
          </p>
        )}

        <div className="grid gap-1.5 text-xs sm:grid-cols-2 sm:gap-2 sm:text-sm">
          {item.company && (
            <div className="min-w-0">
              <span className="font-medium text-[hsl(var(--foreground))]">
                Company: {" "}
              </span>
              <span className="break-words text-[hsl(var(--muted-foreground))]">
                {item.company}
              </span>
            </div>
          )}

          {item.product_type && (
            <div className="min-w-0">
              <span className="font-medium text-[hsl(var(--foreground))]">
                Type: {" "}
              </span>
              <span className="break-words text-[hsl(var(--muted-foreground))]">
                {item.product_type}
              </span>
            </div>
          )}

          {item.recall_number && (
            <div className="min-w-0">
              <span className="font-medium text-[hsl(var(--foreground))]">
                Recall #: {" "}
              </span>
              <span className="break-words text-[hsl(var(--muted-foreground))]">
                {item.recall_number}
              </span>
            </div>
          )}

          {item.event_id && (
            <div className="min-w-0">
              <span className="font-medium text-[hsl(var(--foreground))]">
                Event ID: {" "}
              </span>
              <span className="break-words text-[hsl(var(--muted-foreground))]">
                {item.event_id}
              </span>
            </div>
          )}
        </div>

        {item.distribution && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] sm:text-xs">
              Distribution
            </p>
            <p className="mt-1 line-clamp-3 text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:text-sm sm:leading-6">
              {truncate(item.distribution, 180)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[hsl(var(--border))] pt-3 sm:gap-3">
        <ContentReactionBar
          contentType="recall"
          sourceItemId={item.id}
          initialSummary={reactionSummary}
          userId={userId}
        />
        <SaveRecallButton
          recallId={item.id}
          initialSaved={savedStatus?.saved}
          initialSavedItemId={savedStatus?.saved_item_id}
          userId={userId}
        />
      </div>
    </article>
  );
}

export default function RecallPanel({
  items,
  total,
  title = "Recalls",
  savedMap,
  reactionMap,
  description = "Recent FDA food and medication recalls, normalized for easier review.",
  emptyMessage = "No recent recalls were found.",
  userId,
  savedItemsUsageStatus,
}: RecallPanelProps) {
  return (
    <section className="overflow-visible border-0 bg-transparent shadow-none sm:overflow-hidden sm:rounded-2xl sm:border sm:border-[hsl(var(--border))] sm:bg-[hsl(var(--card))] sm:shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3 border-b-0 p-0 sm:mb-0 sm:border-b sm:border-[hsl(var(--border))] sm:p-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold leading-5 text-[hsl(var(--foreground))] sm:text-lg sm:leading-6">
            {title}
          </h2>
          <p className="mt-1 hidden max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))] sm:block">
            {description}
          </p>
        </div>

        <Link
          href="/recalls"
          className="inline-flex min-h-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] sm:min-h-9"
        >
          More Recalls
        </Link>
      </div>

      <div className="px-0 py-0 sm:px-5 sm:py-4">
        <div className="mb-4 hidden sm:block">
          <ContentSearchBar
            type="recalls"
            placeholder="Search food and medication recalls..."
          />
        </div>

        <UsageLimitNotice
          featureKey="saved_items"
          status={savedItemsUsageStatus}
          className="mb-3 sm:mb-4"
        />

        <p className="mb-3 flex items-start gap-1.5 px-1 text-[11px] text-[hsl(var(--muted-foreground))] sm:text-xs">
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
          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <RecallCard
                key={`${item.source}-${item.id}`}
                item={item}
                savedStatus={savedMap?.[item.id]}
                reactionSummary={reactionMap?.[item.id]}
                userId={userId}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 px-0 pb-0 pt-0 sm:mt-0 sm:px-5 sm:pb-5 sm:pt-1">
        <Link
          href={CLIENT_PATHS.recallPage(2)}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-violet-400/40 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-600 transition-colors hover:bg-violet-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] dark:text-violet-400 sm:w-auto"
        >
          More Recalls
        </Link>
      </div>
    </section>
  );
}