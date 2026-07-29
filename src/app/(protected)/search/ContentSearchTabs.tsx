"use client";

import Link from "next/link";
import type { RecallItem } from "@/types/recalls";
import type { NewsArticle } from "@/lib/server/articlesServerApi";
import SharedTabs, {
  type SharedTabItem,
} from "@/components/SharedTabs/SharedTabs";
import ContentReactionBar from "@/components/ContentReactionBar/ContentReactionBar";
import type { ReactionSummaryMap, SavedCheckMap } from "@/lib/server/bulkContentApi";
import SaveNewsButton from "@/components/SaveNewsButton/SaveNewsButton";
import SaveRecallButton from "@/components/SaveRecallButton/SaveRecallButton";

type SearchType = "all" | "recalls" | "news";

type Props = {
  query: string;
  type: SearchType;
  page: number;
  total: number;
  totalPages: number;
  recalls: RecallItem[];
  news: NewsArticle[];
  recallReactionMap?: ReactionSummaryMap;
  newsReactionMap?: ReactionSummaryMap;
  recallSavedMap?: SavedCheckMap;
  newsSavedMap?: SavedCheckMap;
};

function buildSearchHref({
  query,
  type,
  page,
}: {
  query: string;
  type: SearchType;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (query) params.set("query", query);
  if (type !== "all") params.set("type", type);
  if (page && page > 1) params.set("page", String(page));

  const qs = params.toString();
  return `/search${qs ? `?${qs}` : ""}`;
}

function formatDate(value?: string | null) {
  if (!value) return null;

  if (/^\d{8}$/.test(value)) {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);
    const parsed = new Date(`${year}-${month}-${day}T00:00:00`);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return value;
}

function truncate(text?: string | null, max = 220) {
  if (!text) return null;
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

function RecallResultCard({
  item,
  reactionSummary,
  savedStatus
}: {
  item: RecallItem,
  reactionSummary?: ReactionSummaryMap[number],
  savedStatus?: SavedCheckMap[number]
}) {
  const date = formatDate(item.report_date || item.recall_date);

  return (
    <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Recall
          </span>

          {item.source ? (
            <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2.5 py-1 text-[11px] text-[hsl(var(--muted-foreground))]">
              {item.source === "drug" ? "Medication" : "Food"}
            </span>
          ) : null}

          {item.classification ? (
            <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              {item.classification}
            </span>
          ) : null}
        </div>

        {date ? (
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {date}
          </span>
        ) : null}
      </div>

      <h2 className="mt-3 text-base font-semibold leading-6">{item.title}</h2>

      {item.reason ? (
        <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
          {truncate(item.reason, 260)}
        </p>
      ) : null}

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {item.company ? (
          <p>
            <span className="font-medium">Company: </span>
            <span className="text-[hsl(var(--muted-foreground))]">
              {item.company}
            </span>
          </p>
        ) : null}

        {item.recall_number ? (
          <p>
            <span className="font-medium">Recall #: </span>
            <span className="text-[hsl(var(--muted-foreground))]">
              {item.recall_number}
            </span>
          </p>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
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

function NewsResultCard({
  item,
  reactionSummary,
  savedStatus,
 }: {
  item: NewsArticle, 
  reactionSummary?: ReactionSummaryMap[number],
  savedStatus?: SavedCheckMap[number]
}) {
  const date = formatDate(item.published_at);

  return (
    <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
            News
          </span>

          {item.source ? (
            <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2.5 py-1 text-[11px] text-[hsl(var(--muted-foreground))]">
              {item.source}
            </span>
          ) : null}
        </div>

        {date ? (
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {date}
          </span>
        ) : null}
      </div>

      <h2 className="mt-3 text-base font-semibold leading-6">{item.title}</h2>

      {item.summary ? (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
          {item.summary}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-lg border border-sky-400/35 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-500/20 dark:text-sky-400"
        >
          Read article
        </Link>
        <SaveNewsButton
          articleId={item.id}
          initialSaved={savedStatus?.saved}
          initialSavedItemId={savedStatus?.saved_item_id}
        />
        <ContentReactionBar
          contentType="news"
          sourceItemId={item.id}
          initialSummary={reactionSummary}
        />
      </div>
    </article>
  );
}

function Pagination({
  query,
  type,
  page,
  totalPages,
}: {
  query: string;
  type: SearchType;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 shadow-sm">
      <Link
        href={buildSearchHref({
          query,
          type,
          page: Math.max(1, page - 1),
        })}
        className={[
          "rounded-lg px-3 py-1.5 text-sm font-medium",
          page <= 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-[hsl(var(--muted))]",
        ].join(" ")}
      >
        Previous
      </Link>

      <span className="text-sm text-[hsl(var(--muted-foreground))]">
        Page {page} of {totalPages}
      </span>

      <Link
        href={buildSearchHref({
          query,
          type,
          page: Math.min(totalPages, page + 1),
        })}
        className={[
          "rounded-lg px-3 py-1.5 text-sm font-medium",
          page >= totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-[hsl(var(--muted))]",
        ].join(" ")}
      >
        Next
      </Link>
    </div>
  );
}

export default function ContentSearchTabs({
  query,
  type,
  page,
  total,
  totalPages,
  recalls,
  news,
  recallReactionMap,
  newsReactionMap,
  recallSavedMap,
  newsSavedMap
}: Props) {
  const hasQuery = query.length > 0;
  const hasResults = recalls.length > 0 || news.length > 0;

  const tabs: SharedTabItem<SearchType>[] = [
    {
      id: "all",
      label: "All",
      href: buildSearchHref({ query, type: "all" }),
    },
    {
      id: "recalls",
      label: "Recalls",
      href: buildSearchHref({ query, type: "recalls" }),
    },
    {
      id: "news",
      label: "News",
      href: buildSearchHref({ query, type: "news" }),
    },
  ];

  return (
    <div className="space-y-5">
      <SharedTabs
        tabs={tabs}
        activeTab={type}
        ariaLabel="Search result tabs"
      />
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold break-all">
              {hasQuery ? `Results for "${query}"` : "Search recalls and news"}
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {hasQuery
                ? `${total} result${total !== 1 ? "s" : ""} found`
                : "Enter a search term to begin."}
            </p>
          </div>
        </div>

        {!hasQuery ? (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-5 text-sm text-[hsl(var(--muted-foreground))]">
            Try searching for a product, company, medication name, recall reason,
            or health topic.
          </div>
        ) : !hasResults ? (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-5 text-sm text-[hsl(var(--muted-foreground))]">
            No matching recalls or news stories were found.
          </div>
        ) : (
          <div className="space-y-4">
            {(type === "all" || type === "recalls") && recalls.length > 0 ? (
              <div className="space-y-3">
                {type === "all" ? (
                  <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                    Recalls
                  </h3>
                ) : null}

                {recalls.map((item) => (
                  <RecallResultCard
                    key={`recall-${item.id}`}
                    item={item}
                    reactionSummary={recallReactionMap?.[item.id]}
                    savedStatus={recallSavedMap?.[item.id]}
                  />
                ))}
              </div>
            ) : null}

            {(type === "all" || type === "news") && news.length > 0 ? (
              <div className="space-y-3">
                {type === "all" ? (
                  <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                    News
                  </h3>
                ) : null}

                {news.map((item) => (
                  <NewsResultCard
                    key={`news-${item.id}`}
                    item={item}
                    reactionSummary={newsReactionMap?.[item.id]}
                    savedStatus={newsSavedMap?.[item.id]}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>

      {type !== "all" ? (
        <Pagination
          query={query}
          type={type}
          page={page}
          totalPages={totalPages}
        />
      ) : null}
    </div>
  );
}