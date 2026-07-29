import { cookies } from "next/headers";

import { SERVER_PATHS } from "@/config/paths";

export type AdminStatus = {
  is_admin: boolean;
  role: string;
  user_id: number;
  username: string;
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
  } catch {}

  return "Admin access required.";
}

async function refreshAccessToken(
  cookieHeader: string
): Promise<string | null> {
  try {
    const response = await fetch(
      SERVER_PATHS.refresh,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Cookie: cookieHeader,
        },
        cache: "no-store",
      }
    );

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

async function fetchAdminStatus(
  cookieHeader: string
) {
  return fetch(
    SERVER_PATHS.adminStatus(),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    }
  );
}

export async function getAdminStatus(): Promise<
  | {
      ok: true;
      data: AdminStatus;
    }
  | {
      ok: false;
      status: number;
      message: string;
    }
> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  let cookieHeader = buildCookieHeader(cookieStore);

  let response = await fetchAdminStatus(cookieHeader);

  const shouldTryRefresh =
    response.status === 401 &&
    !accessToken &&
    !!refreshToken;

  if (shouldTryRefresh) {
    const newAccessToken = await refreshAccessToken(cookieHeader);

    if (newAccessToken) {
      cookieHeader = buildCookieHeader(cookieStore, {
        access_token: newAccessToken,
      });

      response = await fetchAdminStatus(cookieHeader);
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: await getErrorMessage(response),
    };
  }

  const data = (await response.json()) as AdminStatus;

  return {
    ok: true,
    data,
  };
}