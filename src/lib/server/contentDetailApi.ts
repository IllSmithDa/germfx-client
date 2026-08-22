import { SERVER_PATHS } from "@/config/paths";
import type { NewsArticle } from "@/lib/server/articlesServerApi";
import type { RecallItem } from "@/types/recalls";

export type ContentDetailType = "news" | "recall";

export type NewsContentDetailResponse = {
  content_type: "news";
  item: NewsArticle;
};

export type RecallContentDetailResponse = {
  content_type: "recall";
  item: RecallItem;
};

export type ContentDetailResponse =
  | NewsContentDetailResponse
  | RecallContentDetailResponse;

type ContentDetailResponseFor<T extends ContentDetailType> =
  T extends "news"
    ? NewsContentDetailResponse
    : RecallContentDetailResponse;

/**
 * Fetch one stored news article or recall item by its database ID.
 *
 * Intended for Server Components / server-side helpers.
 *
 * Returns null only when the ID is invalid or the backend returns 404.
 * Other backend/network/response errors are allowed to surface normally.
 */
export async function fetchContentDetail<T extends ContentDetailType>(
  contentType: T,
  contentId: string | number,
): Promise<ContentDetailResponseFor<T> | null> {
  const normalizedId = String(contentId).trim();

  // Detail IDs currently come from integer database primary keys.
  // Treat malformed route IDs the same as a missing record.
  if (!/^\d+$/.test(normalizedId) || Number(normalizedId) < 1) {
    return null;
  }

  const response = await fetch(
    SERVER_PATHS.contentDetail(contentType, normalizedId),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  // A genuinely missing database record should resolve to the route-level
  // not-found.tsx page.
  if (response.status === 404) {
    return null;
  }

  // Do not turn backend outages or unexpected API failures into false 404s.
  if (!response.ok) {
    throw new Error(
      `Unable to fetch ${contentType} detail (${response.status}).`,
    );
  }

  const data = (await response.json()) as Partial<ContentDetailResponse>;

  if (
    data.content_type !== contentType ||
    !data.item ||
    typeof data.item !== "object"
  ) {
    throw new Error(`Malformed ${contentType} detail response.`);
  }

  return data as ContentDetailResponseFor<T>;
}

/**
 * Convenience helper for /news/[id].
 * Returns the NewsArticle itself rather than the API wrapper.
 */
export async function fetchNewsDetail(
  articleId: string | number,
): Promise<NewsArticle | null> {
  const result = await fetchContentDetail("news", articleId);
  return result?.item ?? null;
}

/**
 * Convenience helper for /recalls/[id].
 * Returns the RecallItem itself rather than the API wrapper.
 */
export async function fetchRecallDetail(
  recallId: string | number,
): Promise<RecallItem | null> {
  const result = await fetchContentDetail("recall", recallId);
  return result?.item ?? null;
}