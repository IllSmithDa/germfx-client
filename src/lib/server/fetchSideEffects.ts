import { SERVER_PATHS } from "@/config/paths";

export type SideEffectItem = {
  name: string;
  description: string;
};

export type ClassifiedSideEffects = {
  common_or_likely: string[];
  possible: string[];
  serious: string[];
  all: string[];
};

export type ClassifiedDescribedSideEffects = {
  common_or_likely: SideEffectItem[];
  possible: SideEffectItem[];
  serious: SideEffectItem[];
  all: SideEffectItem[];
};

export type SideEffectsResponse = {
  side_effects: string[];
  classified: ClassifiedSideEffects;
  classified_described: ClassifiedDescribedSideEffects;
  drug_detail_id?: number | null;
  matched_from_fields?: {
    adverse_reactions_count?: number;
    warnings_raw_count?: number;
    boxed_warning_count?: number;
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

function dedupeDescribed(items: SideEffectItem[]) {
  const out: SideEffectItem[] = [];
  const seen = new Set<string>();

  for (const item of items || []) {
    const name = String(item?.name || "").trim();
    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    out.push({
      name,
      description: String(item?.description || "A reported reaction mentioned in the drug label.").trim(),
    });
  }

  return out;
}

function normalizeClassified(
  classified?: Partial<ClassifiedSideEffects> | null
): ClassifiedSideEffects {
  return {
    common_or_likely: dedupe(classified?.common_or_likely || []),
    possible: dedupe(classified?.possible || []),
    serious: dedupe(classified?.serious || []),
    all: dedupe(classified?.all || []),
  };
}

function normalizeClassifiedDescribed(
  classified?: Partial<ClassifiedDescribedSideEffects> | null
): ClassifiedDescribedSideEffects {
  return {
    common_or_likely: dedupeDescribed(classified?.common_or_likely || []),
    possible: dedupeDescribed(classified?.possible || []),
    serious: dedupeDescribed(classified?.serious || []),
    all: dedupeDescribed(classified?.all || []),
  };
}

function buildDescribedFallbackFromStrings(classified: ClassifiedSideEffects): ClassifiedDescribedSideEffects {
  const toItems = (items: string[]): SideEffectItem[] =>
    dedupe(items).map((name) => ({
      name,
      description: "A reported reaction mentioned in the drug label.",
    }));

  return {
    common_or_likely: toItems(classified.common_or_likely),
    possible: toItems(classified.possible),
    serious: toItems(classified.serious),
    all: toItems(classified.all),
  };
}

export async function fetchSideEffects(options: {
  detailId?: number | string | null;
  drugIndexId?: number | string | null;
}): Promise<SideEffectsResponse> {
  const { detailId, drugIndexId } = options;

  const qs =
    detailId != null
      ? `detail_id=${encodeURIComponent(String(detailId))}`
      : drugIndexId != null
      ? `drug_index_id=${encodeURIComponent(String(drugIndexId))}`
      : "";

  if (!qs) {
    return {
      side_effects: [],
      classified: {
        common_or_likely: [],
        possible: [],
        serious: [],
        all: [],
      },
      classified_described: {
        common_or_likely: [],
        possible: [],
        serious: [],
        all: [],
      },
      drug_detail_id: null,
    };
  }

  try {
    const response = await fetch(SERVER_PATHS.extractSideEffects(qs), {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        side_effects: [],
        classified: {
          common_or_likely: [],
          possible: [],
          serious: [],
          all: [],
        },
        classified_described: {
          common_or_likely: [],
          possible: [],
          serious: [],
          all: [],
        },
        drug_detail_id: null,
      };
    }

    const data = (await response.json()) as Partial<SideEffectsResponse>;

    const classified = normalizeClassified(data.classified);
    const classifiedDescribed =
      data.classified_described
        ? normalizeClassifiedDescribed(data.classified_described)
        : buildDescribedFallbackFromStrings(classified);

    const flatSideEffects =
      dedupe(data.side_effects || []).length > 0
        ? dedupe(data.side_effects || [])
        : classified.all;

    return {
      side_effects: flatSideEffects,
      classified,
      classified_described: classifiedDescribed,
      drug_detail_id: data.drug_detail_id ?? null,
      matched_from_fields: data.matched_from_fields,
    };
  } catch {
    return {
      side_effects: [],
      classified: {
        common_or_likely: [],
        possible: [],
        serious: [],
        all: [],
      },
      classified_described: {
        common_or_likely: [],
        possible: [],
        serious: [],
        all: [],
      },
      drug_detail_id: null,
    };
  }
}