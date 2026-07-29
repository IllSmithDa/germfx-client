// src/types/content.ts
export type DrugUpdateItem = {
  id: number;
  source: string;
  source_type: string;
  external_id: string;
  title: string;
  drug_name?: string | null;
  summary?: string | null;
  published_at?: string | null;
  severity?: string | null;
  classification?: string | null;
  status?: string | null;
  source_url?: string | null;
};

export type DrugUpdatesResponse = {
  items: DrugUpdateItem[];
  meta: {
    matched_medications?: string[];
    disclaimer?: string;
    message?: string;
  };
};

