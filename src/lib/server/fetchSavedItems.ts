import { SERVER_PATHS } from "@/config/paths";
import { fetchWithRefresh } from "@/lib/server/fetchWithRefresh";
import { SavedItemsSort } from "@/types";

export type SavedContentType = "news" | "recall";

export type SavedItem = {
  id: number;
  user_id: number;
  content_type: SavedContentType | string;
  source_item_id?: number | null;
  title: string;
  summary?: string | null;
  url?: string | null;
  image_url?: string | null;
  source_label?: string | null;
  published_at?: string | null;
  snapshot_json?: Record<string, unknown> | null;
  created_at?: string | null;
};

export type SavedItemsResponse = {
  items: SavedItem[];
  count: number;
  total: number;
  limit: number;
  skip: number;
  sort: SavedItemsSort;
};

function getSnapshot(item: Partial<SavedItem>) {
  if (
    item.snapshot_json &&
    typeof item.snapshot_json === "object" &&
    !Array.isArray(item.snapshot_json)
  ) {
    return item.snapshot_json as Record<string, unknown>;
  }

  return null;
}

function firstString(
  ...values: Array<string | null | undefined | unknown>
): string | null {
  for (const value of values) {
    if (typeof value !== "string") continue;

    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }

  return null;
}

function normalizeSavedItem(item: Partial<SavedItem>): SavedItem {
  const snapshot = getSnapshot(item);

  return {
    id: Number(item.id ?? 0),
    user_id: Number(item.user_id ?? 0),
    content_type: String(item.content_type ?? ""),
    source_item_id:
      item.source_item_id == null ? null : Number(item.source_item_id),
    title: String(item.title ?? ""),
    summary: firstString(item.summary, snapshot?.summary) ?? null,
    url: firstString(item.url, snapshot?.url) ?? null,
    image_url:
      firstString(
        item.image_url,
        snapshot?.image_url,
        snapshot?.imageUrl,
        snapshot?.urlToImage,
        snapshot?.image
      ) ?? null,
    source_label:
      firstString(
        item.source_label,
        snapshot?.source_label,
        snapshot?.source,
        snapshot?.source_name
      ) ?? null,
    published_at:
      firstString(
        item.published_at,
        snapshot?.published_at,
        snapshot?.publishedAt,
        snapshot?.published_date
      ) ?? null,
    snapshot_json: snapshot,
    created_at: item.created_at ?? null,
  };
}

export async function fetchSavedItems(params?: {
  content_type?: SavedContentType;
  query?: string;
  sort?: SavedItemsSort;
  limit?: number;
  skip?: number;
}): Promise<SavedItemsResponse> {
  const sort = params?.sort ?? "newest";

  const result = await fetchWithRefresh<Partial<SavedItemsResponse>>(
    SERVER_PATHS.savedItems({
      ...params,
      sort,
    }),
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!result.ok || !result.data) {
    return {
      items: [],
      count: 0,
      total: 0,
      limit: params?.limit ?? 10,
      skip: params?.skip ?? 0,
      sort,
    };
  }

  const data = result.data as Partial<SavedItemsResponse>;

  return {
    items: Array.isArray(data.items)
      ? data.items
          .map(normalizeSavedItem)
          .filter((item) => item.id && item.title)
      : [],
    count: Number(data.count ?? 0),
    total: Number(data.total ?? 0),
    limit: Number(data.limit ?? params?.limit ?? 10),
    skip: Number(data.skip ?? params?.skip ?? 0),
    sort: (data.sort as SavedItemsSort) ?? sort,
  };
}