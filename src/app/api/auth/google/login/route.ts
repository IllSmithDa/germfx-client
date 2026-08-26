import {
  NextRequest,
  NextResponse,
} from "next/server";

import { SERVER_PATHS } from "@/config/paths";

const GOOGLE_REAUTH_RETURN_COOKIE =
  "germfx_google_reauth_return";

const GOOGLE_OAUTH_COOKIE_PATH =
  "/api/auth/google";

const GOOGLE_REAUTH_RETURN_MAX_AGE_SECONDS =
  10 * 60;

type GoogleOAuthIntent =
  | "login"
  | "register"
  | "reauth"
  | "reactivate";

function appendSetCookies(
  target: NextResponse,
  sourceHeaders: Headers,
) {
  const cookies =
    sourceHeaders.getSetCookie?.() ?? [];

  for (const cookie of cookies) {
    target.headers.append(
      "Set-Cookie",
      cookie,
    );
  }
}

function normalizeIntent(
  value: string | null,
): GoogleOAuthIntent {
  if (value === "register") {
    return "register";
  }

  if (value === "reauth") {
    return "reauth";
  }

  if (value === "reactivate") {
    return "reactivate";
  }

  return "login";
}

function normalizeLocalReturnTo(
  request: NextRequest,
  value: string | null,
) {
  if (!value) {
    return "/";
  }

  try {
    const requestUrl = new URL(request.url);
    const resolved = new URL(
      value,
      requestUrl.origin,
    );

    if (resolved.origin !== requestUrl.origin) {
      return "/";
    }

    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return "/";
  }
}

function setReauthReturnCookie(
  request: NextRequest,
  response: NextResponse,
  returnTo: string,
) {
  response.cookies.set({
    name: GOOGLE_REAUTH_RETURN_COOKIE,
    value: returnTo,
    httpOnly: true,
    secure:
      request.nextUrl.protocol === "https:",
    sameSite: "lax",
    maxAge:
      GOOGLE_REAUTH_RETURN_MAX_AGE_SECONDS,
    path: GOOGLE_OAUTH_COOKIE_PATH,
  });
}

export async function GET(
  request: NextRequest,
) {
  const incomingUrl =
    new URL(request.url);

  const intent = normalizeIntent(
    incomingUrl.searchParams.get("intent"),
  );

  const backendUrl = new URL(
    SERVER_PATHS.googleLogin,
  );

  backendUrl.searchParams.set(
    "intent",
    intent,
  );

  const apiRes = await fetch(
    backendUrl.toString(),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",

      // FastAPI responds with Google's
      // authorization URL. The browser,
      // not Next's server fetch, must follow it.
      redirect: "manual",
    },
  );

  const location =
    apiRes.headers.get("location");

  if (
    apiRes.status >= 300 &&
    apiRes.status < 400 &&
    location
  ) {
    const response =
      NextResponse.redirect(
        location,
        apiRes.status,
      );

    if (intent === "reauth") {
      const returnTo =
        normalizeLocalReturnTo(
          request,
          incomingUrl.searchParams.get(
            "return_to",
          ),
        );

      // Do Next-owned cookie writes first. Next's response.cookies API may
      // rebuild the Set-Cookie header, so FastAPI cookies are appended last.
      setReauthReturnCookie(
        request,
        response,
        returnTo,
      );
    }

    // Append FastAPI's OAuth state + intent cookies last so they cannot be
    // overwritten by a later NextResponse.cookies mutation.
    appendSetCookies(
      response,
      apiRes.headers,
    );

    return response;
  }

  const body = await apiRes.text();

  const response = new NextResponse(
    body,
    {
      status: apiRes.status,
      headers: {
        "Content-Type":
          apiRes.headers.get(
            "content-type",
          ) ??
          "application/json",
      },
    },
  );

  appendSetCookies(
    response,
    apiRes.headers,
  );

  return response;
}
