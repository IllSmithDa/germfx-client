import { SERVER_PATHS } from "@/config/paths";

export type SafetyWarningItem = {
  key: string;
  title: string;
  matched_terms: string[];
  excerpts: string[];
};

export type SafetyWarningsResponse = {
  drug_detail_id?: number | null;
  warning_categories: string[];
  warnings_grouped: Record<
    string,
    {
      title: string;
      matched_terms: string[];
      excerpts: string[];
    }
  >;
  warnings_flat: SafetyWarningItem[];
  raw_text: string;
  matched_from_fields?: {
    warnings_raw_count?: number;
  };
};

function dedupe(items: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const item of items || []) {
    const value = String(item || "").trim();
    if (!value) continue;

    const key = value.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    out.push(value);
  }

  return out;
}

function normalizeWarningItem(item: Partial<SafetyWarningItem>): SafetyWarningItem {
  return {
    key: String(item.key || "").trim(),
    title: String(item.title || "").trim(),
    matched_terms: dedupe(item.matched_terms || []),
    excerpts: dedupe(item.excerpts || []),
  };
}

export async function fetchSafetyWarnings(options: {
  detailId?: number | string | null;
  drugIndexId?: number | string | null;
}): Promise<SafetyWarningsResponse> {
  const { detailId, drugIndexId } = options;

  const qs =
    detailId != null
      ? `detail_id=${encodeURIComponent(String(detailId))}`
      : drugIndexId != null
      ? `drug_index_id=${encodeURIComponent(String(drugIndexId))}`
      : "";

  if (!qs) {
    return {
      drug_detail_id: null,
      warning_categories: [],
      warnings_grouped: {},
      warnings_flat: [],
      raw_text: "",
    };
  }

  try {
    const response = await fetch(SERVER_PATHS.extractSafetyWarnings(qs), {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        drug_detail_id: null,
        warning_categories: [],
        warnings_grouped: {},
        warnings_flat: [],
        raw_text: "",
      };
    }

    const data = (await response.json()) as Partial<SafetyWarningsResponse>;

    const warningsFlat = (data.warnings_flat || [])
      .map(normalizeWarningItem)
      .filter((item) => item.key && item.title);

    return {
      drug_detail_id: data.drug_detail_id ?? null,
      warning_categories: dedupe(data.warning_categories || []),
      warnings_grouped: data.warnings_grouped || {},
      warnings_flat: warningsFlat,
      raw_text: String(data.raw_text || ""),
      matched_from_fields: data.matched_from_fields,
    };
  } catch {
    return {
      drug_detail_id: null,
      warning_categories: [],
      warnings_grouped: {},
      warnings_flat: [],
      raw_text: "",
    };
  }
}