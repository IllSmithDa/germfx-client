import { NextRequest, NextResponse } from "next/server";

import { SERVER_PATHS } from "@/config/paths";

type UsageLimitItem = {
  id: number;
  feature_key: string;
  free_limit: number;
  description?: string | null;
  updated_by_user_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type UsageLimitsListResponse = {
  items?: UsageLimitItem[];
  total?: number;
  message?: string;
  detail?: unknown;
};

type UsageLimitUpdateRequest = {
  feature_key?: string;
  free_limit?: number;
  description?: string | null;
};

function getErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  if ("detail" in data) {
    const detail = data.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (
      detail &&
      typeof detail === "object" &&
      "message" in detail &&
      typeof detail.message === "string"
    ) {
      return detail.message;
    }
  }

  if ("message" in data && typeof data.message === "string") {
    return data.message;
  }

  return fallback;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getForwardedHeaders(request: NextRequest) {
  const headers = new Headers();

  headers.set("Accept", "application/json");

  const cookie = request.headers.get("cookie");

  if (cookie) {
    headers.set("Cookie", cookie);
  }

  return headers;
}

export async function GET(request: NextRequest) {
  const featureKey = request.nextUrl.searchParams.get("feature_key")?.trim();

  const backendResponse = await fetch(SERVER_PATHS.adminUsageLimits, {
    method: "GET",
    headers: getForwardedHeaders(request),
    cache: "no-store",
  });

  const data = (await safeJson(backendResponse)) as UsageLimitsListResponse | null;

  if (!backendResponse.ok) {
    return NextResponse.json(
      {
        message: getErrorMessage(
          data,
          "Unable to load usage limits.",
        ),
      },
      {
        status: backendResponse.status,
      },
    );
  }

  const items = data?.items ?? [];

  if (featureKey) {
    const selected =
      items.find((item) => item.feature_key === featureKey) ?? null;

    return NextResponse.json(
      {
        items,
        total: items.length,
        feature_key: featureKey,
        selected,
      },
      {
        status: 200,
      },
    );
  }

  return NextResponse.json(
    {
      items,
      total: data?.total ?? items.length,
    },
    {
      status: 200,
    },
  );
}

export async function PATCH(request: NextRequest) {
  let body: UsageLimitUpdateRequest;

  try {
    body = (await request.json()) as UsageLimitUpdateRequest;
  } catch {
    return NextResponse.json(
      {
        message: "Invalid usage limit update payload.",
      },
      {
        status: 400,
      },
    );
  }

  const featureKey = body.feature_key?.trim();

  if (!featureKey) {
    return NextResponse.json(
      {
        message: "feature_key is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (typeof body.free_limit !== "number" || Number.isNaN(body.free_limit)) {
    return NextResponse.json(
      {
        message: "free_limit must be a number.",
      },
      {
        status: 400,
      },
    );
  }

  const backendResponse = await fetch(SERVER_PATHS.adminUsageLimit(featureKey), {
    method: "PATCH",
    headers: {
      ...Object.fromEntries(getForwardedHeaders(request)),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      free_limit: body.free_limit,
      description: body.description,
    }),
    cache: "no-store",
  });

  const data = await safeJson(backendResponse);

  if (!backendResponse.ok) {
    return NextResponse.json(
      {
        message: getErrorMessage(
          data,
          "Unable to update usage limit.",
        ),
      },
      {
        status: backendResponse.status,
      },
    );
  }

  return NextResponse.json(data, {
    status: 200,
  });
}