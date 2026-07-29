import Link from "next/link";
import Image from "next/image";
import type { AriaRole } from "react";

import type { NewsArticle } from "@/lib/server/articlesServerApi";
import SaveNewsButton from "@/components/SaveNewsButton/SaveNewsButton";
import ContentReactionBar from "@/components/ContentReactionBar/ContentReactionBar";
import type {
  ReactionSummaryMap,
  SavedCheckMap,
} from "@/lib/server/bulkContentApi";

export type NewsListViewProps = {
  articles: NewsArticle[];
  savedMap?: SavedCheckMap;
  reactionMap?: ReactionSummaryMap;
  userId?: number | string | null;
  emptyMessage?: string;
  role?: AriaRole;
  className?: string;
};

type NewsSavedStatus = SavedCheckMap[keyof SavedCheckMap];
type NewsReactionSummary = ReactionSummaryMap[keyof ReactionSummaryMap];

function getInitial(title: string) {
  const trimmed = title.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "N";
}

function formatPublishedDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function ArticleImageOrInitial({
  title,
  imageUrl,
  variant = "thumbnail",
}: {
  title: string;
  imageUrl?: string | null;
  variant?: "hero" | "thumbnail";
}) {
  const mediaClassName =
    variant === "hero"
      ? "relative flex aspect-[16/9] w-full overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-blue-500/10 shadow-sm"
      : "relative flex aspect-square w-[8.25rem] shrink-0 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-blue-500/10 shadow-sm md:w-[8.75rem] lg:w-[9.25rem]";

  if (imageUrl) {
    return (
      <div className={mediaClassName}>
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes={
            variant === "hero"
              ? "(max-width: 640px) 100vw, 152px"
              : "(max-width: 1024px) 140px, 148px"
          }
          className="object-cover transition-transform duration-200 group-hover/image:scale-[1.02]"
        />
      </div>
    );
  }

  return (
    <div className={`${mediaClassName} items-center justify-center`}>
      <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
        {getInitial(title)}
      </span>
    </div>
  );
}

function ArticleImageLink({
  article,
  variant = "thumbnail",
}: {
  article: NewsArticle;
  variant?: "hero" | "thumbnail";
}) {
  return (
    <Link
      href={article.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Read article: ${article.title}`}
      className={[
        "group/image block rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--card))]",
        variant === "thumbnail" ? "shrink-0" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ArticleImageOrInitial
        title={article.title}
        imageUrl={article.image_url}
        variant={variant}
      />
    </Link>
  );
}

function ArticleTitleLink({
  article,
  className = "",
}: {
  article: NewsArticle;
  className?: string;
}) {
  return (
    <Link
      href={article.url}
      target="_blank"
      rel="noreferrer"
      className="group/title block rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--card))]"
    >
      <h3
        className={[
          "font-semibold text-[hsl(var(--foreground))] transition-colors group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400",
          className,
        ].join(" ")}
      >
        {article.title}
      </h3>
    </Link>
  );
}

function ArticleSummaryLink({
  article,
  className = "",
}: {
  article: NewsArticle;
  className?: string;
}) {
  if (!article.summary) {
    return null;
  }

  return (
    <Link
      href={article.url}
      target="_blank"
      rel="noreferrer"
      className="group/summary block rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--card))]"
    >
      <p
        className={[
          "text-[hsl(var(--muted-foreground))] transition-colors group-hover/summary:text-[hsl(var(--foreground))]",
          className,
        ].join(" ")}
      >
        {article.summary}
      </p>
    </Link>
  );
}

function ArticleActions({
  article,
  savedStatus,
  reactionSummary,
  userId,
  compactSave = false,
  showReadButton = false,
}: {
  article: NewsArticle;
  savedStatus?: NewsSavedStatus;
  reactionSummary?: NewsReactionSummary;
  userId?: number | string | null;
  compactSave?: boolean;
  showReadButton?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showReadButton ? (
        <Link
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-blue-400/35 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] dark:text-blue-400"
        >
          Read article
        </Link>
      ) : null}
      <ContentReactionBar
        contentType="news"
        sourceItemId={article.id}
        initialSummary={reactionSummary}
        userId={userId}
      />
      <div
        className={
          compactSave
            ? "[&_button]:h-8 [&_button]:min-w-10 [&_button]:justify-center [&_button]:!rounded-lg [&_button]:px-3 [&_button]:leading-none [&_button_svg]:h-3.5 [&_button_svg]:w-3.5"
            : ""
        }
      >
        <SaveNewsButton
          articleId={article.id}
          initialSaved={savedStatus?.saved}
          initialSavedItemId={savedStatus?.saved_item_id}
          userId={userId}
        />
      </div>
    </div>
  );
}

function MobileArticleCard({
  article,
  savedMap,
  reactionMap,
  userId,
}: {
  article: NewsArticle;
  savedMap?: SavedCheckMap;
  reactionMap?: ReactionSummaryMap;
  userId?: number | string | null;
}) {
  const publishedLabel = formatPublishedDate(article.published_at);
  const savedStatus = savedMap?.[article.id];
  const reactionSummary = reactionMap?.[article.id];

  return (
    <article className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm sm:hidden">
      <ArticleImageLink article={article} variant="hero" />

      <div className="pt-3">
        <ArticleTitleLink
          article={article}
          className="line-clamp-3 text-lg leading-snug"
        />

        <ArticleSummaryLink
          article={article}
          className="mt-2 line-clamp-3 text-sm leading-6"
        />

        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[hsl(var(--muted-foreground))]">
          <span className="min-w-0 truncate">{article.source}</span>
          {publishedLabel ? (
            <span className="shrink-0">{publishedLabel}</span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 border-t border-[hsl(var(--border))] pt-3">
        <ArticleActions
          article={article}
          savedStatus={savedStatus}
          reactionSummary={reactionSummary}
          userId={userId}
          compactSave
        />
      </div>
    </article>
  );
}

function DesktopArticleCard({
  article,
  savedMap,
  reactionMap,
  userId,
}: {
  article: NewsArticle;
  savedMap?: SavedCheckMap;
  reactionMap?: ReactionSummaryMap;
  userId?: number | string | null;
}) {
  const publishedLabel = formatPublishedDate(article.published_at);
  const savedStatus = savedMap?.[article.id];
  const reactionSummary = reactionMap?.[article.id];

  return (
    <article className="hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition-colors hover:bg-[hsl(var(--muted)/0.35)] sm:block">
      <div className="flex items-start gap-4">
        <ArticleImageLink article={article} />

        <div className="min-w-0 flex-1 py-0.5">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex max-w-full items-center truncate rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
              <span className="truncate">{article.source}</span>
            </span>

            {publishedLabel ? (
              <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                {publishedLabel}
              </span>
            ) : null}
          </div>

          <ArticleTitleLink
            article={article}
            className="line-clamp-2 text-base leading-6"
          />

          <ArticleSummaryLink
            article={article}
            className="mt-1.5 line-clamp-3 text-sm leading-6"
          />
        </div>
      </div>

      <div className="mt-4 border-t border-[hsl(var(--border))] pt-3">
        <ArticleActions
          article={article}
          savedStatus={savedStatus}
          reactionSummary={reactionSummary}
          userId={userId}
          showReadButton
        />
      </div>
    </article>
  );
}

function NewsArticleCard({
  article,
  savedMap,
  reactionMap,
  userId,
}: {
  article: NewsArticle;
  savedMap?: SavedCheckMap;
  reactionMap?: ReactionSummaryMap;
  userId?: number | string | null;
}) {
  return (
    <>
      <MobileArticleCard
        article={article}
        savedMap={savedMap}
        reactionMap={reactionMap}
        userId={userId}
      />

      <DesktopArticleCard
        article={article}
        savedMap={savedMap}
        reactionMap={reactionMap}
        userId={userId}
      />
    </>
  );
}

export default function NewsListView({
  articles,
  savedMap,
  reactionMap,
  userId,
  emptyMessage = "News stories will appear here as articles are synced.",
  role,
  className = "",
}: NewsListViewProps) {
  if (articles.length === 0) {
    return (
      <div
        role={role}
        className={className}
      >
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-4 py-6 text-sm text-[hsl(var(--muted-foreground))]">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div
      role={role}
      className={["space-y-4 sm:space-y-3", className].filter(Boolean).join(" ")}
    >
      {articles.map((article) => (
        <NewsArticleCard
          key={article.id}
          article={article}
          savedMap={savedMap}
          reactionMap={reactionMap}
          userId={userId}
        />
      ))}
    </div>
  );
}