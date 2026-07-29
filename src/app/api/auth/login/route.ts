import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  SERVER_PATHS,
} from "@/config/paths";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const apiRes = await fetch(SERVER_PATHS.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const text = await apiRes.text();

  const response = new NextResponse(text, {
    status: apiRes.status,
    headers: {
      "Content-Type":
        apiRes.headers.get("content-type") ??
        "application/json",
    },
  });

  const setCookieHeaders =
    apiRes.headers.getSetCookie?.() ??
    [];

  for (const cookie of setCookieHeaders) {
    response.headers.append(
      "Set-Cookie",
      cookie
    );
  }

  return response;
}