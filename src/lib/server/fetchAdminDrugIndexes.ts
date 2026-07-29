import { cookies } from "next/headers";

import { SERVER_PATHS } from "@/config/paths";
import {
  AdminDrugIndexesParams,
  AdminDrugIndexKind,
  AdminDrugIndexSort,
} from "@/types/admin";

export type AdminDrugIndexItem = {
  id: number;
  name: string;
  normalized_name: string;
  kind: string;
  manufacturer: string | null;
  source: string;
  ndc_codes: string[];
  upc_codes: string[];
  latest_detail_id: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AdminDrugIndexPagination = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type AdminDrugIndexSearchParams =
  AdminDrugIndexesParams & {
    q: string;
  };

type AdminDrugIndexesResult =
  | {
      ok: true;
      data: AdminDrugIndexesResponse;
      error: null;
      status: number;
    }
  | {
      ok: false;
      data: null;
      error: string;
      status: number;
    };

export type AdminOpenFdaSyncInfo = {
  attempted: boolean;
  query: string | null;
  remote_count: number;
  upserted: boolean;
};

export type AdminDrugIndexesFilters = {
  q?: string | null;
  kind?: AdminDrugIndexKind | null;
  source?: string | null;
  manufacturer?: string | null;
  has_upc?: boolean | null;
  has_ndc?: boolean | null;
  has_latest_detail?: boolean | null;
  sort?: AdminDrugIndexSort;

  sync_openfda?: boolean | null;
  openfda_limit?: number | null;
};

export type AdminDrugIndexesResponse = {
  items: AdminDrugIndexItem[];
  pagination: AdminDrugIndexPagination;
  filters: AdminDrugIndexesFilters;
  openfda_sync?: AdminOpenFdaSyncInfo;
};

function buildCookieHeader(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  extraCookies?: Record<string, string>
) {
  const cookieMap = new Map<string, string>();

  for (const cookie of cookieStore.getAll()) {
    cookieMap.set(cookie.name, cookie.value);
  }

  for (const [name, value] of Object.entries(extraCookies ?? {})) {
    cookieMap.set(name, value);
  }

  return Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

async function getErrorMessage(response: Response) {
  try {
    const data = await response.json();

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (typeof data?.error === "string") {
      return data.error;
    }
  } catch {}

  return "Unable to retrieve admin drug indexes.";
}

function getRefreshPath() {
  return SERVER_PATHS.refresh;
}

async function refreshAccessToken(
  cookieHeader: string
): Promise<string | null> {
  try {
    const response = await fetch(getRefreshPath(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (typeof data?.access_token === "string") {
      return data.access_token;
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchAdminDrugIndexesRequest(
  params: AdminDrugIndexesParams & {
    q?: string;
  },
  cookieHeader: string,
  accessToken?: string | null
) {
  return fetch(
    SERVER_PATHS.adminDrugIndexes({
      ...params,
      page: params.page ?? 1,
      page_size: params.page_size ?? 25,
      sort: params.sort ?? "updated_asc",
    }),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),
      },
      cache: "no-store",
    }
  );
}

async function fetchAdminDrugIndexesBase(
  params?: AdminDrugIndexesParams & {
    q?: string;
  }
): Promise<AdminDrugIndexesResult> {
  const shouldSyncOpenFda =
    params?.sync_openfda ??
    Boolean(params?.q?.trim());

  const resolvedParams = {
    ...params,
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 25,
    sort: params?.sort ?? "updated_asc",
    sync_openfda: shouldSyncOpenFda,
    openfda_limit: params?.openfda_limit ?? 100,
  };

  const cookieStore = await cookies();

  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  let cookieHeader = buildCookieHeader(cookieStore);

  try {
    let response = await fetchAdminDrugIndexesRequest(
      resolvedParams,
      cookieHeader,
      accessToken
    );

    if (response.status === 401 && refreshToken) {
      const newAccessToken = await refreshAccessToken(cookieHeader);

      if (newAccessToken) {
        cookieHeader = buildCookieHeader(cookieStore, {
          access_token: newAccessToken,
        });

        response = await fetchAdminDrugIndexesRequest(
          resolvedParams,
          cookieHeader,
          newAccessToken
        );
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        data: null,
        status: response.status,
        error: await getErrorMessage(response),
      };
    }

    const data =
      (await response.json()) as AdminDrugIndexesResponse;

    return {
      ok: true,
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      status: 500,
      error:
        error instanceof Error
          ? error.message
          : "Unable to retrieve admin drug indexes.",
    };
  }
}

export async function getAdminDrugIndexes(
  params?: AdminDrugIndexesParams
) {
  return fetchAdminDrugIndexesBase(params);
}

export async function searchAdminDrugIndexesByQuery(
  params: AdminDrugIndexSearchParams
) {
  const q = params.q.trim();

  if (!q) {
    return {
      ok: false as const,
      data: null,
      status: 400,
      error: "Search query is required.",
    };
  }

  return fetchAdminDrugIndexesBase({
    ...params,
    q,
    sync_openfda: params.sync_openfda ?? true,
    openfda_limit: params.openfda_limit ?? 100
  });
}