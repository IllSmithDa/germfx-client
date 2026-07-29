import { SERVER_PATHS } from "@/config/paths";

export type DrugByCodeResponse = {
  brand_names?: string[];
  generic_names?: string[];
  manufacturer_names?: string[];
  upc_codes?: string[];
  package_ndc?: string[];
  unii?: string[];
  rxcui?: string[];
  route?: string[];
  product_type?: string[];
  purpose_or_indications?: string[];
  boxed_warning?: string[];
  warnings_key?: Record<string, unknown>;
  warnings_raw?: string[];
  warnings_simple?: string[];
  adverse_reactions?: string[];
  drug_interactions?: string[];
  dosage_and_administration?: string[];
  effective_time?: string | null;
  openfda_meta?: Record<string, unknown>;
  source?: string;
  query_used?: string | null;
  drug_detail_id: number;
  drug_index_id?: number | null;
  symptoms_table?: string[];
};

export type DrugIndexByCodeItem = {
  id: number;
  name: string;
  normalized_name: string;
  kind: "brand" | "generic" | "substance" | string;
  manufacturer?: string | null;
  source: string;
  ndc_codes: string[];
  upc_codes: string[];
  latest_detail_id?: number | null;
  updated_at?: string | null;
  is_stale: boolean;
};

export type DrugIndexByCodeResponse = {
  input: string;
  lookup_candidates: string[];
  matched: boolean;
  count: number;
  items: DrugIndexByCodeItem[];
  resync: {
    attempted: boolean;
    forced: boolean;
    resynced: boolean;
    remote_count: number;
    stale_after_days: number;
    stale_local_count: number;
  };
};

export type DrugIndexByCodeParams = {
  limit?: number;
  stale_after_days?: number;
  force_resync?: boolean;
};

async function getErrorMessage(
  response: Response
): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (typeof data?.message === "string") {
      return data.message;
    }
  } catch {}

  return "Failed to find a drug for this code.";
}

function normalizeCode(code: string) {
  return code.trim();
}

/**
 * New scan flow:
 * Scanned UPC/NDC code -> DrugIndex results.
 *
 * This calls:
 * /api/medications/drug-index-by-code
 *
 * Use this for the barcode scanner going forward.
 */
export async function getDrugIndexByCodeRequest(
  code: string,
  params?: DrugIndexByCodeParams
): Promise<DrugIndexByCodeResponse> {
  const normalizedCode =
    normalizeCode(code);

  if (!normalizedCode) {
    throw new Error("Missing code.");
  }

  const response = await fetch(
    SERVER_PATHS.drugIndexByCode(
      normalizedCode,
      params
    ),
    {
      method: "GET",
      cache: "no-store",
    }
  );
  // console.log(`response: ${response}`)
  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}

/**
 * Legacy scan flow:
 * Scanned UPC/NDC/RxCUI/UNII code -> full DrugDetail payload.
 *
 * Keep this around while migrating the scanner UI.
 */
export async function getDrugDetailByCodeRequest(
  code: string
): Promise<DrugByCodeResponse> {
  const normalizedCode =
    normalizeCode(code);

  if (!normalizedCode) {
    throw new Error("Missing code.");
  }

  const response = await fetch(
    SERVER_PATHS.drugDetailByCode(
      normalizedCode
    ),
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}

/**
 * Backwards-compatible alias.
 *
 * For now, this still points to the old detail-based behavior so existing
 * components do not break. When the scanner UI is ready to consume
 * DrugIndexByCodeResponse, switch callers to getDrugIndexByCodeRequest().
 */
export const getDrugByCodeRequest =
  getDrugDetailByCodeRequest;