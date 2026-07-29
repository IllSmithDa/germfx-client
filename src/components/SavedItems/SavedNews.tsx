/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Image from "next/image";
import Link from "next/link";
import type { SavedItem, SavedItemsResponse } from "@/lib/server/fetchSavedItems";
import UnsaveButton from "./UnsaveButton";
import { SavedItemsSort } from "@/types";
import SavedItemsSortSelect from "./SavedItemSortSelect";
import SavedItemPagination from "./SavedItemPagination";

function getInitial(title: string) {
  const trimmed = title.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "N";
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
}

function SavedNewsImage({
  title,
  imageUrl,
  articleUrl,
}: {
  title: string;
  imageUrl?: string | null;
  articleUrl?: string | null;
}) {
  const mediaClassName = [
    "relative flex w-full shrink-0 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-sky-500/10 shadow-sm",
    "aspect-[16/9] sm:aspect-square sm:w-[8.5rem] md:w-[9.5rem]",
  ].join(" ");

  const content = imageUrl ? (
    <Image
      src={imageUrl}
      alt=""
      fill
      sizes="(min-width: 768px) 152px, (min-width: 640px) 136px, 100vw"
      className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center">
      <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">
        {getInitial(title)}
      </span>
    </div>
  );

  if (!articleUrl) {
    return <div className={mediaClassName}>{content}</div>;
  }

  return (
    <Link
      href={articleUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open saved article: ${title}`}
      className={`${mediaClassName} group focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]`}
    >
      {content}
    </Link>
  );
}

function SavedNewsTitle({ item }: { item: SavedItem }) {
  const className =
    "text-base font-semibold leading-6 text-[hsl(var(--foreground))] underline-offset-2 hover:underline sm:text-base";

  if (!item.url) {
    return <h3 className={className}>{item.title}</h3>;
  }

  return (
    <h3 className={className}>
      <Link href={item.url} target="_blank" rel="noreferrer">
        {item.title}
      </Link>
    </h3>
  );
}

function SavedNewsSummary({ item }: { item: SavedItem }) {
  if (!item.summary) return null;

  const className =
    "mt-2 line-clamp-3 text-sm leading-6 text-[hsl(var(--muted-foreground))] sm:line-clamp-2";

  if (!item.url) {
    return <p className={className}>{item.summary}</p>;
  }

  return (
    <Link
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className={`${className} block transition-colors hover:text-[hsl(var(--foreground))]`}
    >
      {item.summary}
    </Link>
  );
}

function NewsSavedCard({ item }: { item: SavedItem }) {
  const publishedLabel = formatDate(item.published_at);

  return (
    <article className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm transition-colors hover:bg-[hsl(var(--muted)/0.25)] sm:p-4">
      <div className="grid gap-3 sm:flex sm:items-start sm:gap-4">
        <SavedNewsImage
          title={item.title}
          imageUrl={item.image_url}
          articleUrl={item.url}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium leading-none text-sky-600 dark:text-sky-400">
              Saved News
            </span>

            {item.source_label ? (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {item.source_label}
              </span>
            ) : null}

            {publishedLabel ? (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {publishedLabel}
              </span>
            ) : null}
          </div>

          <SavedNewsTitle item={item} />
          <SavedNewsSummary item={item} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[hsl(var(--border))] pt-3">
        {item.url ? (
          <Link
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="hidden min-h-8 items-center justify-center rounded-lg border border-sky-400/35 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] dark:text-sky-400 sm:inline-flex"
          >
            Read article
          </Link>
        ) : null}

        <UnsaveButton savedItemId={item.id} />
      </div>
    </article>
  );
}

export default function SavedNewsTab({
  news,
  currentPage,
  query,
  recallQuery,
  pageSize,
  sort,
  recallSort,
  baseUrl,
}: {
  news: SavedItemsResponse;
  currentPage: number;
  query: string;
  recallQuery: string;
  pageSize: number;
  sort: SavedItemsSort;
  recallSort?: SavedItemsSort;
  baseUrl?: string;
}) {
  const totalPages = Math.max(1, Math.ceil((news.total || 0) / pageSize));

  return (
    <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm sm:p-5">
      <div className="mb-4 w-full sm:flex sm:justify-end">
        <SavedItemsSortSelect
          value={sort}
          baseUrl={baseUrl as string}
          sortParam="s_news_sort"
          pageParam="s_news_page"
          extraParams={
            baseUrl === "/bookmarks"
              ? { tab: "news", recalls_query: recallQuery }
              : { view: "saved" }
          }
        />
      </div>

      {news.items.length === 0 ? (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-sm text-[hsl(var(--muted-foreground))]">
          No saved news found.
        </div>
      ) : (
        <div className="space-y-4">
          {news.items.map((item) => (
            <NewsSavedCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <SavedItemPagination
        baseUrl={baseUrl as string}
        currentPage={currentPage}
        totalPages={totalPages}
        query={query}
        sort={sort}
        pageParam="s_news_page"
        sortParam="s_news_sort"
        extraParams={
          baseUrl === "/bookmarks"
            ? { tab: "news", recalls_query: recallQuery }
            : { view: "saved" }
        }
      />
    </div>
  );
}