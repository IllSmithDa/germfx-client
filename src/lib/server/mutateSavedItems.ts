import { cookies } from "next/headers";
import { SERVER_PATHS } from "@/config/paths";
import type { SavedContentType, SavedItem } from "./fetchSavedItems";
import { fetchWithRefresh } from "./fetchWithRefresh";

type SaveItemPayload = {
  content_type: SavedContentType;
  source_item_id: number;
};

type DeleteSavedItemResponse = {
  deleted: boolean;
  saved_item_id: number;
};

function normalizeSavedItem(item: Partial<SavedItem>): SavedItem {
  return {
    id: Number(item.id ?? 0),
    user_id: Number(item.user_id ?? 0),
    content_type: String(item.content_type ?? ""),
    source_item_id:
      item.source_item_id == null ? null : Number(item.source_item_id),
    title: String(item.title ?? ""),
    summary: item.summary ?? null,
    url: item.url ?? null,
    image_url: item.image_url ?? null,
    source_label: item.source_label ?? null,
    published_at: item.published_at ?? null,
    snapshot_json:
      item.snapshot_json && typeof item.snapshot_json === "object"
        ? item.snapshot_json
        : null,
    created_at: item.created_at ?? null,
  };
}

async function serverAuthHeaders(
  extra?: Record<string, string>
): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return {
    Accept: "application/json",
    ...(extra ?? {}),
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

export async function saveItemServer(
  payload: SaveItemPayload
): Promise<SavedItem | null> {
  try {
    const response = await fetchWithRefresh(SERVER_PATHS.savedItems(), {
      method: "POST",
      headers: await serverAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.data) as Partial<SavedItem>;
    return normalizeSavedItem(data);
  } catch {
    return null;
  }
}

export async function deleteSavedItemServer(
  savedItemId: number
): Promise<DeleteSavedItemResponse | null> {
  try {
    const response = await fetchWithRefresh(SERVER_PATHS.deleteSavedItem(savedItemId), {
      method: "DELETE",
      headers: await serverAuthHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.data) as Partial<DeleteSavedItemResponse>;

    return {
      deleted: Boolean(data.deleted),
      saved_item_id: Number(data.saved_item_id ?? savedItemId),
    };
  } catch {
    return null;
  }
}