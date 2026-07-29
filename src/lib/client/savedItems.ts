import { fetchWithClientRefresh } from "./clientRefresh";

export type SavedContentType =
  | "news"
  | "recall";

export type SavedItem = {
  id: number;
  user_id: number;
  content_type:
    | SavedContentType
    | string;
  source_item_id?: number | null;
  title: string;
  summary?: string | null;
  url?: string | null;
  image_url?: string | null;
  source_label?: string | null;
  published_at?: string | null;
  snapshot_json?: Record<
    string,
    unknown
  > | null;
  created_at?: string | null;
};

export type SavedItemsResponse = {
  items: SavedItem[];
  count: number;
  total?: number;
  limit?: number;
  skip?: number;
};

export type SaveItemPayload = {
  content_type: SavedContentType;
  source_item_id: number;
};

export type SavedCheckResponse = {
  saved: boolean;
  saved_item_id?: number | null;
};

export type DeleteSavedItemResponse = {
  deleted: boolean;
  saved_item_id: number;
};

const SAVED_ITEMS_BASE_URL = "/api/backend/saved-items";


export class ApiUsageLimitError extends Error {
  code: string;
  featureKey?: string;
  limit?: number;
  currentCount?: number;
  remaining?: number;

  constructor({
    message,
    code,
    featureKey,
    limit,
    currentCount,
    remaining,
  }: {
    message: string;
    code: string;
    featureKey?: string;
    limit?: number;
    currentCount?: number;
    remaining?: number;
  }) {
    super(message);
    this.name = "ApiUsageLimitError";
    this.code = code;
    this.featureKey = featureKey;
    this.limit = limit;
    this.currentCount = currentCount;
    this.remaining = remaining;
  }
}

async function getApiError(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "");
    return new Error(text || fallback);
  }

  try {
    const data = await response.json();
    const detail = data?.detail;

    if (
      detail &&
      typeof detail === "object" &&
      detail.code === "FREE_LIMIT_REACHED"
    ) {
      return new ApiUsageLimitError({
        message:
          typeof detail.message === "string"
            ? detail.message
            : "You have reached the free usage limit.",
        code: detail.code,
        featureKey: detail.feature_key,
        limit: detail.limit,
        currentCount: detail.current_count,
        remaining: detail.remaining,
      });
    }

    if (
      detail &&
      typeof detail === "object" &&
      typeof detail.message === "string"
    ) {
      return new Error(detail.message);
    }

    if (typeof detail === "string") {
      return new Error(detail);
    }

    if (typeof data?.message === "string") {
      return new Error(data.message);
    }

    return new Error(fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function saveItem({
  content_type,
  source_item_id,
}: {
  content_type: "news" | "recall";
  source_item_id: number;
}) {
  const response = await fetchWithClientRefresh(SAVED_ITEMS_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      content_type,
      source_item_id,
    }),
  });

  if (!response.ok) {
    if (!response.ok) {
      throw await getApiError(response, "Failed to save item.");
    }
  }

  return response.json();
}

export async function deleteSavedItem(savedItemId: number) {
  const response = await fetch(`${SAVED_ITEMS_BASE_URL}/${savedItemId}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (!response.ok) {
      throw await getApiError(response, "Failed to delete saved item.");
    }
  }

  if (response.status === 204) {
    return {
      deleted: true,
      saved_item_id: savedItemId,
    };
  }

  return response.json();
}

export async function checkSavedItem({
  content_type,
  source_item_id,
}: {
  content_type: "news" | "recall";
  source_item_id: number;
}) {
  const params = new URLSearchParams({
    content_type,
    source_item_id: String(source_item_id),
  });

  const response = await fetch(`${SAVED_ITEMS_BASE_URL}/check?${params}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw await getApiError(response, "Failed to check saved item.");
  }

  return response.json();
}