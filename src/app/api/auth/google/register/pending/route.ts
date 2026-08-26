import {
  NextRequest,
  NextResponse,
} from "next/server";

import { SERVER_PATHS } from "@/config/paths";

export async function GET(request: NextRequest) {
  const cookieHeader =
    request.headers.get("cookie");

  const apiRes = await fetch(
    SERVER_PATHS.googleRegisterPending,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader
          ? { Cookie: cookieHeader }
          : {}),
      },
      cache: "no-store",
    },
  );

  const body = await apiRes.text();

  return new NextResponse(body, {
    status: apiRes.status,
    headers: {
      "Content-Type":
        apiRes.headers.get("content-type") ??
        "application/json",
    },
  });
}