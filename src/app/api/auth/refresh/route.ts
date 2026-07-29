// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SERVER_PATHS } from "@/config/paths";

function extractSetCookieHeaders(response: Response): string[] {
  // Some runtimes support getSetCookie()
  const headersAny = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headersAny.getSetCookie === "function") {
    return headersAny.getSetCookie();
  }

  // Fallback: try standard header access
  const single = response.headers.get("set-cookie");
  return single ? [single] : [];
}

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  const backendResponse = await fetch(SERVER_PATHS.refresh, {
    method: "POST",
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!backendResponse.ok) {
    return NextResponse.json(
      { detail: "Refresh failed" },
      { status: backendResponse.status }
    );
  }

  const data = await backendResponse.json().catch(() => ({}));

  const nextResponse = NextResponse.json(data, { status: 200 });

  const setCookies = extractSetCookieHeaders(backendResponse);
  for (const cookie of setCookies) {
    nextResponse.headers.append("set-cookie", cookie);
  }

  return nextResponse;
}