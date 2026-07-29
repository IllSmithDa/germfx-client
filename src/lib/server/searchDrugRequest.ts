import { SERVER_PATHS } from "@/config/paths";
import { normalizeDrugQuery } from "@/lib/helpers/normalizeDrugQuery";

export const DRUG_SEARCH_MAX_LENGTH = 100;

export type SearchResult = {
  name: string;
  id: string;
  type: "brand" | "generic" | "substance" | string;
  manufacturer?: string | null;
  score?: number | null;
};

export type SearchResponse = {
  items: SearchResult[];
  used_fuzzy: boolean;
  did_you_mean: string | null;
  error_message?: string | null;
  status?: number | null;
};

type ApiSearchResponse = {
  items?: {
    name: string;
    id: string;
    kind: string;
    manufacturer?: string | null;
    score?: number | null;
  }[];
  used_fuzzy?: boolean;
  did_you_mean?: string | null;
  detail?: unknown;
  message?: unknown;
};

function emptySearchResponse(
  errorMessage: string,
  status: number | null = null,
): SearchResponse {
  return {
    items: [],
    used_fuzzy: false,
    did_you_mean: null,
    error_message: errorMessage,
    status,
  };
}

function getApiErrorMessage(data: ApiSearchResponse | null): string {
  if (!data) {
    return "Unable to search drugs right now.";
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (
    data.detail &&
    typeof data.detail === "object" &&
    "message" in data.detail &&
    typeof data.detail.message === "string"
  ) {
    return data.detail.message;
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  return "Unable to search drugs right now.";
}

async function safeReadJson(response: Response): Promise<ApiSearchResponse | null> {
  try {
    return (await response.json()) as ApiSearchResponse;
  } catch {
    return null;
  }
}

export async function searchDrugRequest(
  query: string,
  limit = 10,
): Promise<SearchResponse> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return emptySearchResponse("Please enter a drug name to search.");
  }

  if (trimmedQuery.length > DRUG_SEARCH_MAX_LENGTH) {
    return emptySearchResponse(
      `Drug search must be ${DRUG_SEARCH_MAX_LENGTH} characters or fewer.`,
      400,
    );
  }

  const normalizedQuery = normalizeDrugQuery(trimmedQuery);
  const finalQuery = normalizedQuery || trimmedQuery;

  if (finalQuery.length > DRUG_SEARCH_MAX_LENGTH) {
    return emptySearchResponse(
      `Drug search must be ${DRUG_SEARCH_MAX_LENGTH} characters or fewer.`,
      400,
    );
  }

  try {
    const url = SERVER_PATHS.drugSearch(finalQuery, limit);

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const data = await safeReadJson(response);

    if (!response.ok) {
      return emptySearchResponse(
        getApiErrorMessage(data),
        response.status,
      );
    }

    return {
      items: (data?.items ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        type: item.kind,
        manufacturer: item.manufacturer ?? null,
        score: item.score ?? null,
      })),
      used_fuzzy: data?.used_fuzzy ?? false,
      did_you_mean: data?.did_you_mean ?? null,
      error_message: null,
      status: response.status,
    };
  } catch {
    return emptySearchResponse(
      "Unable to connect to the drug search service. Please try again.",
    );
  }
}