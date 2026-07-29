export type RecallSort = "latest" | "popular" | "oldest";
export type RecallType = "all" | "food" | "drug";

export type RecallItem = {
  id: number;
  source: "food" | "drug" | string;
  product_type: "food" | "medication" | string;

  classification?: string | null;
  status?: string | null;

  recall_date?: string | null;
  report_date?: string | null;

  title: string;
  reason?: string | null;
  company?: string | null;
  distribution?: string | null;

  recall_number?: string | null;
  event_id?: string | null;

  created_at?: string | null;
};

export type RecallListResponse = {
  items: RecallItem[];
  count: number;
  total: number;
  limit: number;
  skip: number;
  sort?: string;
  type?: string;
};

export type RecallSyncResponse = {
  sync_date: string;
  food_fetched: number;
  drug_fetched: number;
  inserted: number;
  trimmed: number;
  total_after: number;
};


