// src/lib/server/contentStatusApi.ts

import { cookies } from "next/headers";
import { SERVER_PATHS } from "@/config/paths";
import type { ReactionSummary } from "@/lib/client/reactionApi";
import { fetchWithRefresh } from "./fetchWithRefresh";

export type SavedCheckMap = Record<
  number,
  { saved: boolean; saved_item_id: number | null }
>;

export type ReactionSummaryMap = Record<number, ReactionSummary>;

async function authHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return {
    Accept: "application/json",
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

export async function fetchBulkSavedChecks(
  contentType: "news" | "recall",
  ids: number[]
): Promise<SavedCheckMap> {
  const cleanIds = [...new Set(ids.filter(Boolean))];

  if (cleanIds.length === 0) return {};

  try {
    const res = await fetchWithRefresh(SERVER_PATHS.checkSavedItemsBulk(contentType, cleanIds), {
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (!res.ok) return {};

    const data = (await res.data) as {
      items?: Array<{
        source_item_id: number;
        saved: boolean;
        saved_item_id?: number | null;
      }>;
    };

    return Object.fromEntries(
      (data.items ?? []).map((item) => [
        item.source_item_id,
        {
          saved: Boolean(item.saved),
          saved_item_id:
            item.saved_item_id == null ? null : Number(item.saved_item_id),
        },
      ])
    );
  } catch {
    return {};
  }
}

export async function fetchBulkReactionSummaries(
  contentType: "news" | "recall",
  ids: number[]
): Promise<ReactionSummaryMap> {
  const cleanIds = [...new Set(ids.filter(Boolean))];

  if (cleanIds.length === 0) return {};

  try {
    const res = await fetchWithRefresh(SERVER_PATHS.reactionSummaryBulk(contentType, cleanIds), {
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return {};
    }
    const data = (await res.data) as { items?: ReactionSummary[] };

    return Object.fromEntries(
      (data.items ?? []).map((item) => [item.source_item_id, item])
    );
  } catch {
    return {};
  }
}