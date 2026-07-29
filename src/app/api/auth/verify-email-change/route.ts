import { SERVER_PATHS } from "@/config/paths";
import { NextRequest, NextResponse } from "next/server";

function getErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "Unable to verify this email change link.";
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

  return "Unable to verify this email change link.";
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function appendBackendSetCookies(
  backendResponse: Response,
  nextResponse: NextResponse,
) {
  const headersWithGetSetCookie = backendResponse.headers as Headers & {
    getSetCookie?: () => string[];
  };

  const setCookies =
    headersWithGetSetCookie.getSetCookie?.() ??
    [backendResponse.headers.get("set-cookie")].filter(Boolean);

  for (const cookie of setCookies) {
    if (cookie) {
      nextResponse.headers.append("set-cookie", cookie);
    }
  }
}

export async function POST(request: NextRequest) {
  let token = "";

  try {
    const body = (await request.json()) as { token?: string };
    token = body.token?.trim() ?? "";
  } catch {
    token = "";
  }

  if (!token) {
    return NextResponse.json(
      { message: "Missing email change verification token." },
      { status: 400 },
    );
  }

  const backendResponse = await fetch(SERVER_PATHS.verifyEmailChange, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ token }),
    cache: "no-store",
  });

  const data = await safeJson(backendResponse);

  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: getErrorMessage(data) },
      { status: backendResponse.status },
    );
  }

  const response = NextResponse.json(
    {
      message:
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string"
          ? data.message
          : "Email changed successfully. Please log in again with your new email.",
    },
    { status: 200 },
  );

  appendBackendSetCookies(backendResponse, response);

  return response;
}

export async function GET() {
  return NextResponse.json(
    {
      message:
        "Open the email change verification page and confirm the change to continue.",
    },
    { status: 405 },
  );
}