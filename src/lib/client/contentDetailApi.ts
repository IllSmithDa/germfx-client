"use client";

import { API_PROXY_PATHS } from "@/config/paths";
import type { NewsArticle } from "@/lib/server/articlesServerApi";
import type { RecallItem } from "@/types/recalls";

export type ClientContentDetailType = "news" | "recall";

type NewsContentDetailResponse = {
  content_type: "news";
  item: NewsArticle;
};

type RecallContentDetailResponse = {
  content_type: "recall";
  item: RecallItem;
};

type ContentDetailResponseFor<T extends ClientContentDetailType> =
  T extends "news"
    ? NewsContentDetailResponse
    : RecallContentDetailResponse;

/**
 * Optional browser-side version.
 *
 * Most detail-page loading should use the server helper instead.
 * This exists for future Client Components that need to refetch an item.
 */
export async function getContentDetailClient<
  T extends ClientContentDetailType,
>(
  contentType: T,
  contentId: string | number,
): Promise<ContentDetailResponseFor<T> | null> {
  const normalizedId = String(contentId).trim();

  if (!normalizedId) {
    return null;
  }

  try {
    const response = await fetch(
      API_PROXY_PATHS.contentDetail(contentType, normalizedId),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Partial<
      NewsContentDetailResponse | RecallContentDetailResponse
    >;

    if (
      data.content_type !== contentType ||
      !data.item ||
      typeof data.item !== "object"
    ) {
      return null;
    }

    return data as ContentDetailResponseFor<T>;
  } catch {
    return null;
  }
}

export async function getNewsDetailClient(
  articleId: string | number,
): Promise<NewsArticle | null> {
  const result = await getContentDetailClient("news", articleId);
  return result?.item ?? null;
}

export async function getRecallDetailClient(
  recallId: string | number,
): Promise<RecallItem | null> {
  const result = await getContentDetailClient("recall", recallId);
  return result?.item ?? null;
}