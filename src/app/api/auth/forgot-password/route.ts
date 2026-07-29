import { NextRequest, NextResponse } from "next/server";
import { SERVER_PATHS } from "@/config/paths";

export const dynamic = "force-dynamic";

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getForwardedHeaders(request: NextRequest) {
  const headers = new Headers();

  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");

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

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        detail: {
          message: "Invalid request body.",
          code: "INVALID_JSON",
        },
      },
      { status: 400 },
    );
  }

  const backendResponse = await fetch(SERVER_PATHS.forgotPassword, {
    method: "POST",
    headers: getForwardedHeaders(request),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await safeJson(backendResponse);

  if (!backendResponse.ok) {
    return NextResponse.json(
      data ?? {
        detail: {
          message: "Unable to send reset link.",
          code: "FORGOT_PASSWORD_FAILED",
        },
      },
      { status: backendResponse.status },
    );
  }

  return NextResponse.json(data, { status: backendResponse.status });
}