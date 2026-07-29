import {
  NextResponse,
} from "next/server";

import {
  cookies,
} from "next/headers";

import {
  SERVER_PATHS,
} from "@/config/paths";

function buildCookieHeader(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  extraCookies?: Record<string, string>
) {
  const cookieMap =
    new Map<string, string>();

  for (const cookie of cookieStore.getAll()) {
    cookieMap.set(
      cookie.name,
      cookie.value
    );
  }

  for (const [
    name,
    value,
  ] of Object.entries(
    extraCookies ?? {}
  )) {
    cookieMap.set(
      name,
      value
    );
  }

  return Array.from(
    cookieMap.entries()
  )
    .map(
      ([name, value]) =>
        `${name}=${value}`
    )
    .join("; ");
}

async function refreshAccessToken(
  cookieHeader: string
) {
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

    const data =
      await response.json();

    if (
      typeof data?.access_token ===
      "string"
    ) {
      return data.access_token;
    }

    return null;
  } catch {
    return null;
  }
}

async function forwardPatch({
  drugIndexId,
  body,
  cookieHeader,
  accessToken,
}: {
  drugIndexId: string;
  body: unknown;
  cookieHeader: string;
  accessToken?: string | null;
}) {
  return fetch(
    SERVER_PATHS.adminDrugIndexCodes(
      drugIndexId
    ),
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      drugIndexId: string;
    }>;
  }
) {
  const { drugIndexId } =
    await context.params;

  const body =
    await request.json();

  const cookieStore =
    await cookies();

  const refreshToken =
    cookieStore.get(
      "refresh_token"
    )?.value;

  let cookieHeader =
    buildCookieHeader(cookieStore);

  let backendResponse =
    await forwardPatch({
      drugIndexId,
      body,
      cookieHeader,
    });

  if (
    backendResponse.status === 401 &&
    refreshToken
  ) {
    const newAccessToken =
      await refreshAccessToken(
        cookieHeader
      );

    if (newAccessToken) {
      cookieHeader =
        buildCookieHeader(
          cookieStore,
          {
            access_token:
              newAccessToken,
          }
        );

      backendResponse =
        await forwardPatch({
          drugIndexId,
          body,
          cookieHeader,
          accessToken:
            newAccessToken,
        });
    }
  }

  const text =
    await backendResponse.text();

  return new NextResponse(text, {
    status: backendResponse.status,
    headers: {
      "Content-Type":
        backendResponse.headers.get(
          "Content-Type"
        ) ?? "application/json",
    },
  });
}