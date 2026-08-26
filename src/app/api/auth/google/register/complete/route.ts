import {
  NextRequest,
  NextResponse,
} from "next/server";

import { SERVER_PATHS } from "@/config/paths";

function appendSetCookies(
  target: NextResponse,
  sourceHeaders: Headers,
) {
  const cookies = sourceHeaders.getSetCookie?.() ?? [];

  for (const cookie of cookies) {
    target.headers.append("Set-Cookie", cookie);
  }
}

export async function POST(request: NextRequest) {
  const cookieHeader =
    request.headers.get("cookie");

  const body = await request.text();

  const apiRes = await fetch(
    SERVER_PATHS.googleRegisterComplete,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(cookieHeader
          ? { Cookie: cookieHeader }
          : {}),
      },
      body,
      cache: "no-store",
    },
  );

  const text = await apiRes.text();

  const response = new NextResponse(text, {
    status: apiRes.status,
    headers: {
      "Content-Type":
        apiRes.headers.get("content-type") ??
        "application/json",
    },
  });

  // On success this forwards access/refresh cookies and clears the temporary
  // Google registration cookie.
  appendSetCookies(
    response,
    apiRes.headers,
  );

  return response;
}