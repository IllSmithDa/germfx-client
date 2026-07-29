import { CLIENT_PATHS } from "@/config/paths";

export type AdminDrugDetailSort =
  | "updated_desc"
  | "created_desc"
  | "name_asc";

export type BooleanFilter = "all" | "yes" | "no";

export type AdminDrugDetailOut = {
  id: number;
  drug_index_id: number | null;
  index_name: string | null;
  index_kind: string | null;
  index_latest_detail_id: number | null;
  latest_for_index: boolean;

  name: string | null;
  normalized_name: string | null;
  source: string | null;
  query_used: string | null;
  effective_time: string | null;
  created_at: string | null;
  updated_at: string | null;

  brand_names: string[];
  generic_names: string[];
  manufacturer_names: string[];

  warnings_count: number;
  warnings_simple_count: number;
  side_effects_count: number;
  indications_count: number;
  adverse_reactions_count: number;
  interactions_count: number;
  dosage_count: number;

  has_warnings: boolean;
  has_clean_fields: boolean;
};

export type AdminDrugDetailEditableFields = {
  purpose_or_indications: string[];
  dosage_and_administration: string[];
  side_effects: string[];
  warnings_simple: string[];
};

export type AdminSafetyWarningItem = {
  key: string;
  title: string;
  matched_terms: string[];
  excerpts: string[];
};

export type AdminSafetyWarningsOut = {
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
  warnings_flat: AdminSafetyWarningItem[];
  raw_text: string;
  matched_from_fields?: {
    warnings_raw_count?: number;
    source?: string;
  };
  source?: "generated" | "curated" | string;
};

export type AdminDrugDetailListOut = {
  items: AdminDrugDetailOut[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
};

export type AdminDrugDetailReadOut = {
  detail: AdminDrugDetailOut;
  payload: Record<string, unknown>;
  editable_fields: AdminDrugDetailEditableFields;
  safety_warnings: AdminSafetyWarningsOut;
};

export type DrugDetailResyncPayload = {
  message: string;
  drug_detail_id: number;
  requested_detail_id: number;
  updated_by_user_id: number;
  make_latest: boolean;
  reset_clean_fields: boolean;
  payload: Record<string, unknown>;
  safety_warnings?: AdminSafetyWarningsOut;
};

export type ListAdminDrugDetailsParams = {
  query?: string;
  hasWarnings?: BooleanFilter;
  hasCleanFields?: BooleanFilter;
  source?: string;
  sort?: AdminDrugDetailSort;
  page?: number;
  pageSize?: number;
};

export type ResyncDrugDetailOptions = {
  detailId: number;
  drug?: string;
  makeLatest?: boolean;
  resetCleanFields?: boolean;
};

export type UpdateAdminDrugDetailCuratedFieldsOptions = {
  detailId: number;
  fields: AdminDrugDetailEditableFields;
};

export type UpdateAdminDrugDetailSafetyWarningsOptions = {
  detailId: number;
  warningsFlat: AdminSafetyWarningItem[];
};

const REFRESH_URL = "/api/backend/auth/refresh";

export class AdminDrugDetailsApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "AdminDrugDetailsApiError";
    this.status = status;
    this.code = code;
  }
}

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function refreshSession() {
  const response = await fetch(REFRESH_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  return response.ok;
}

async function adminDrugDetailsFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const requestInit: RequestInit = {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  };

  let response = await fetch(input, requestInit);

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshSession();

  if (!refreshed) {
    return response;
  }

  response = await fetch(input, requestInit);

  return response;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await readJson(response);

  if (!response.ok) {
    const detail = data?.detail;

    const message =
      typeof detail === "string"
        ? detail
        : typeof detail?.message === "string"
          ? detail.message
          : "Admin drug detail request failed.";

    const code =
      detail && typeof detail === "object" && typeof detail.code === "string"
        ? detail.code
        : undefined;

    throw new AdminDrugDetailsApiError(message, response.status, code);
  }

  return data as T;
}

function appendBooleanFilter(
  params: URLSearchParams,
  key: string,
  value?: BooleanFilter,
) {
  if (!value || value === "all") {
    return;
  }

  params.set(key, value === "yes" ? "true" : "false");
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function normalizeSafetyWarningItem(
  item: Partial<AdminSafetyWarningItem>,
): AdminSafetyWarningItem {
  return {
    key: String(item.key || "").trim(),
    title: String(item.title || "").trim(),
    matched_terms: toStringArray(item.matched_terms),
    excerpts: toStringArray(item.excerpts),
  };
}

function normalizeSafetyWarningsOut(value: unknown): AdminSafetyWarningsOut {
  const data = (value || {}) as Partial<AdminSafetyWarningsOut>;

  const warningsFlat = toStringArray([]); // keeps this helper imported-free

  void warningsFlat;

  return {
    drug_detail_id: data.drug_detail_id ?? null,
    warning_categories: toStringArray(data.warning_categories),
    warnings_grouped: data.warnings_grouped || {},
    warnings_flat: (data.warnings_flat || [])
      .map(normalizeSafetyWarningItem)
      .filter((item) => item.key && item.title),
    raw_text: String(data.raw_text || ""),
    matched_from_fields: data.matched_from_fields,
    source: data.source,
  };
}

function normalizeReadOut(data: AdminDrugDetailReadOut): AdminDrugDetailReadOut {
  return {
    ...data,
    editable_fields: {
      purpose_or_indications: toStringArray(
        data.editable_fields?.purpose_or_indications,
      ),
      dosage_and_administration: toStringArray(
        data.editable_fields?.dosage_and_administration,
      ),
      side_effects: toStringArray(data.editable_fields?.side_effects),
      warnings_simple: toStringArray(data.editable_fields?.warnings_simple),
    },
    safety_warnings: normalizeSafetyWarningsOut(data.safety_warnings),
  };
}

function adminDrugDetailCuratedFieldsApiPath(detailId: number | string) {
  return `${CLIENT_PATHS.adminDrugDetailApiPath(detailId)}/curated-fields`;
}

function adminDrugDetailSafetyWarningsApiPath(detailId: number | string) {
  return `${CLIENT_PATHS.adminDrugDetailApiPath(detailId)}/safety-warnings`;
}

export async function listAdminDrugDetails({
  query,
  hasWarnings = "all",
  hasCleanFields = "all",
  source,
  sort = "updated_desc",
  page = 1,
  pageSize = 25,
}: ListAdminDrugDetailsParams): Promise<AdminDrugDetailListOut> {
  const params = new URLSearchParams();

  if (query?.trim()) {
    params.set("query", query.trim());
  }

  appendBooleanFilter(params, "has_warnings", hasWarnings);
  appendBooleanFilter(params, "has_clean_fields", hasCleanFields);

  if (source?.trim()) {
    params.set("source", source.trim());
  }

  params.set("sort", sort);
  params.set("page", String(page));
  params.set("page_size", String(pageSize));

  const response = await adminDrugDetailsFetch(
    `${CLIENT_PATHS.adminDrugDetailsApiPath()}?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return parseResponse<AdminDrugDetailListOut>(response);
}

export async function getAdminDrugDetail(
  detailId: number,
): Promise<AdminDrugDetailReadOut> {
  if (!Number.isInteger(detailId) || detailId <= 0) {
    throw new AdminDrugDetailsApiError(
      "Please provide a valid drug detail ID.",
      400,
      "INVALID_DRUG_DETAIL_ID",
    );
  }

  const response = await adminDrugDetailsFetch(
    CLIENT_PATHS.adminDrugDetailApiPath(detailId),
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const data = await parseResponse<AdminDrugDetailReadOut>(response);

  return normalizeReadOut(data);
}

export async function resyncDrugDetailById({
  detailId,
  drug,
  makeLatest = true,
  resetCleanFields = true,
}: ResyncDrugDetailOptions): Promise<DrugDetailResyncPayload> {
  if (!Number.isInteger(detailId) || detailId <= 0) {
    throw new AdminDrugDetailsApiError(
      "Please provide a valid drug detail ID.",
      400,
      "INVALID_DRUG_DETAIL_ID",
    );
  }

  const params = new URLSearchParams();

  params.set("make_latest", String(makeLatest));
  params.set("reset_clean_fields", String(resetCleanFields));

  if (drug?.trim()) {
    params.set("drug", drug.trim());
  }

  const response = await adminDrugDetailsFetch(
    `${CLIENT_PATHS.adminDrugDetailResyncApiPath(detailId)}?${params.toString()}`,
    {
      method: "POST",
    },
  );

  const data = await parseResponse<DrugDetailResyncPayload>(response);

  return {
    ...data,
    safety_warnings: data.safety_warnings
      ? normalizeSafetyWarningsOut(data.safety_warnings)
      : undefined,
  };
}

export async function updateAdminDrugDetailCuratedFields({
  detailId,
  fields,
}: UpdateAdminDrugDetailCuratedFieldsOptions): Promise<AdminDrugDetailReadOut> {
  if (!Number.isInteger(detailId) || detailId <= 0) {
    throw new AdminDrugDetailsApiError(
      "Please provide a valid drug detail ID.",
      400,
      "INVALID_DRUG_DETAIL_ID",
    );
  }

  const response = await adminDrugDetailsFetch(
    adminDrugDetailCuratedFieldsApiPath(detailId),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fields),
    },
  );

  const data = await parseResponse<AdminDrugDetailReadOut>(response);

  return normalizeReadOut(data);
}

export async function updateAdminDrugDetailSafetyWarnings({
  detailId,
  warningsFlat,
}: UpdateAdminDrugDetailSafetyWarningsOptions): Promise<AdminDrugDetailReadOut> {
  if (!Number.isInteger(detailId) || detailId <= 0) {
    throw new AdminDrugDetailsApiError(
      "Please provide a valid drug detail ID.",
      400,
      "INVALID_DRUG_DETAIL_ID",
    );
  }

  const response = await adminDrugDetailsFetch(
    adminDrugDetailSafetyWarningsApiPath(detailId),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        warnings_flat: warningsFlat.map(normalizeSafetyWarningItem),
      }),
    },
  );

  const data = await parseResponse<AdminDrugDetailReadOut>(response);

  return normalizeReadOut(data);
}