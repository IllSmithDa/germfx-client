import { SERVER_PATHS } from "@/config/paths";
import type {
  RecallItem,
  RecallListResponse,
  RecallSyncResponse,

} from "@/types/recalls";

function normalizeRecallItem(item: Partial<RecallItem>): RecallItem {
  return {
    id: Number(item.id ?? 0),
    source: String(item.source ?? ""),
    product_type: String(item.product_type ?? ""),
    classification: item.classification ?? null,
    status: item.status ?? null,
    recall_date: item.recall_date ?? null,
    report_date: item.report_date ?? null,
    title: String(item.title ?? ""),
    reason: item.reason ?? null,
    company: item.company ?? null,
    distribution: item.distribution ?? null,
    recall_number: item.recall_number ?? null,
    event_id: item.event_id ?? null,
    created_at: item.created_at ?? null,
  };
}

export async function fetchRecalls(params?: {
  limit?: number;
  skip?: number;
  source?: string;
  query?: string;
  state?: string;
  sort?: string;
  type?: string;
  sync_if_needed?: boolean;
}): Promise<RecallListResponse> {
  try {
    const response = await fetch(SERVER_PATHS.recalls(params), {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        items: [],
        count: 0,
        total: 0,
        limit: params?.limit ?? 20,
        skip: params?.skip ?? 0,
        sort: params?.sort ?? "latest",
        type: params?.type ?? "all",
      };
    }

    const data = (await response.json()) as Partial<RecallListResponse>;

    return {
      items: Array.isArray(data.items)
        ? data.items.map(normalizeRecallItem).filter((item) => item.id && item.title)
        : [],
      count: Number(data.count ?? 0),
      total: Number(data.total ?? 0),
      limit: Number(data.limit ?? params?.limit ?? 20),
      skip: Number(data.skip ?? params?.skip ?? 0),
    };
  } catch {
    return {
      items: [],
      count: 0,
      total: 0,
      limit: params?.limit ?? 20,
      skip: params?.skip ?? 0,
    };
  }
}

export async function syncRecalls(): Promise<RecallSyncResponse | null> {
  try {
    const response = await fetch(SERVER_PATHS.syncRecalls(), {
      method: "POST",
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Partial<RecallSyncResponse>;

    return {
      sync_date: String(data.sync_date ?? ""),
      food_fetched: Number(data.food_fetched ?? 0),
      drug_fetched: Number(data.drug_fetched ?? 0),
      inserted: Number(data.inserted ?? 0),
      trimmed: Number(data.trimmed ?? 0),
      total_after: Number(data.total_after ?? 0),
    };
  } catch {
    return null;
  }
}