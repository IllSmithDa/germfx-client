import { NextRequest, NextResponse } from "next/server";

import { SERVER_PATHS } from "@/config/paths";

export const dynamic = "force-dynamic";

function getForwardedHeaders(request: NextRequest) {
  const headers = new Headers();

  headers.set("Accept", "application/json");

  const cookie = request.headers.get("cookie");
  const authorization = request.headers.get("authorization");

  if (cookie) {
    headers.set("Cookie", cookie);
  }

  if (authorization) {
    headers.set("Authorization", authorization);
  }

  return headers;
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const featureKey = request.nextUrl.searchParams.get("feature_key")?.trim();

  const backendUrl = featureKey
    ? SERVER_PATHS.usageLimitStatus(featureKey)
    : SERVER_PATHS.usageLimitStatusAll();

  const backendResponse = await fetch(backendUrl, {
    method: "GET",
    headers: getForwardedHeaders(request),
    cache: "no-store",
  });

  const data = await safeJson(backendResponse);

  if (!backendResponse.ok) {
    return NextResponse.json(
      data ?? {
        detail: "Failed to load usage limit status.",
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