// src/lib/server/fetchWithRefresh.ts
import { cookies } from "next/headers";
import { SERVER_PATHS } from "@/config/paths";

type FetchWithRefreshResult<T> = {
  ok: boolean;
  status: number;
  data: T | null | unknown;
  error?: string;
};

type RefreshResponse = {
  access_token?: string;
  token_type?: string;
};

async function safeJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function extractError(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail?: unknown }).detail;

    if (typeof detail === "string") return detail;

    try {
      return JSON.stringify(detail);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

export async function fetchWithRefresh<T>(
  url: string,
  init?: RequestInit
): Promise<FetchWithRefreshResult<T>> {
  const cookieStore = await cookies();
  const originalCookieHeader = cookieStore.toString();

  async function doFetch(cookieHeader: string) {
    return fetch(url, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
  }

  let response: Response;

  try {
    response = await doFetch(originalCookieHeader);
  } catch (error) {
    console.error("Initial fetch failed:", error);
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Network request failed",
    };
  }

  if (response.ok) {
    return {
      ok: true,
      status: response.status,
      data: await safeJson<T>(response),
    };
  }

  if (response.status !== 401) {
    const errorData = await safeJson<unknown>(response);

    return {
      ok: false,
      status: response.status,
      data: errorData,
      error: extractError(errorData, "Request failed"),
    };
  }

  let refreshResponse: Response;

  try {
    refreshResponse = await fetch(SERVER_PATHS.refresh, {
      method: "POST",
      headers: {
        Cookie: originalCookieHeader,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Refresh fetch failed:", error);
    return {
      ok: false,
      status: 401,
      data: null,
      error: "Refresh request failed",
    };
  }

  if (!refreshResponse.ok) {
    const errorData = await safeJson<unknown>(refreshResponse);

    return {
      ok: false,
      status: refreshResponse.status,
      data: errorData,
      error: extractError(errorData, "Request failed"),
    };
  }

  const refreshData = await safeJson<RefreshResponse>(refreshResponse);
  const newAccessToken = refreshData?.access_token;

  if (!newAccessToken) {
    return {
      ok: false,
      status: 401,
      data: null,
      error: "Refresh response missing access token",
    };
  }

  const retryCookieHeader = originalCookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => !part.startsWith("access_token="))
    .concat(`access_token=${newAccessToken}`)
    .join("; ");

  try {
    response = await doFetch(retryCookieHeader);
  } catch (error) {
    console.error("Retry fetch failed:", error);
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Retry request failed",
    };
  }

  const data = await safeJson<T>(response);

  return {
    ok: response.ok,
    status: response.status,
    data,
    error: response.ok ? undefined : extractError(data, "Request failed"),
  };
}