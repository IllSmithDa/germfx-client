// api/auth/google/callback/route.ts

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  CLIENT_PATHS,
  SERVER_PATHS,
} from "@/config/paths";

const GOOGLE_OAUTH_INTENT_COOKIE =
  "germfx_google_oauth_intent";

const GOOGLE_REAUTH_RETURN_COOKIE =
  "germfx_google_reauth_return";

const GOOGLE_OAUTH_COOKIE_PATH =
  "/api/auth/google";

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

function clearReauthReturnCookie(
  request: NextRequest,
  response: NextResponse,
) {
  response.cookies.set({
    name: GOOGLE_REAUTH_RETURN_COOKIE,
    value: "",
    httpOnly: true,
    secure:
      request.nextUrl.protocol === "https:",
    sameSite: "lax",
    maxAge: 0,
    path: GOOGLE_OAUTH_COOKIE_PATH,
  });
}

function getSafeReauthReturnUrl(
  request: NextRequest,
) {
  const requestUrl =
    new URL(request.url);

  const candidate =
    request.cookies.get(
      GOOGLE_REAUTH_RETURN_COOKIE,
    )?.value;

  if (!candidate) {
    return new URL(
      "/",
      requestUrl.origin,
    );
  }

  try {
    const resolved = new URL(
      candidate,
      requestUrl.origin,
    );

    if (
      resolved.origin !==
      requestUrl.origin
    ) {
      return new URL(
        "/",
        requestUrl.origin,
      );
    }

    return resolved;
  } catch {
    return new URL(
      "/",
      requestUrl.origin,
    );
  }
}

function buildOAuthErrorRedirect(
  request: NextRequest,
  errorCode: string,
) {
  const intent =
    request.cookies.get(
      GOOGLE_OAUTH_INTENT_COOKIE,
    )?.value;

  if (intent === "reauth") {
    const returnUrl =
      getSafeReauthReturnUrl(request);

    returnUrl.searchParams.set(
      "reauth_error",
      errorCode,
    );

    return NextResponse.redirect(
      returnUrl,
      302,
    );
  }

  if (intent === "reactivate") {
    const reactivateUrl = new URL(
      "/reactivate-account",
      request.url,
    );

    reactivateUrl.searchParams.set(
      "oauth_error",
      errorCode,
    );

    return NextResponse.redirect(
      reactivateUrl,
      302,
    );
  }

  const destination =
    intent === "register"
      ? CLIENT_PATHS.clientRegisterPath()
      : CLIENT_PATHS.clientLoginPath();

  const url = new URL(
    destination,
    request.url,
  );

  url.searchParams.set(
    "oauth_error",
    errorCode,
  );

  return NextResponse.redirect(
    url,
    302,
  );
}

async function getOAuthErrorCode(
  response: Response,
): Promise<string> {
  try {
    const data = await response.json();

    if (
      data?.detail &&
      typeof data.detail === "object" &&
      typeof data.detail.code ===
        "string"
    ) {
      return data.detail.code;
    }
  } catch {}

  return "GOOGLE_OAUTH_ERROR";
}

export async function GET(
  request: NextRequest,
) {
  const incomingUrl =
    new URL(request.url);

  const callbackUrl = new URL(
    SERVER_PATHS.googleCallback,
  );

  callbackUrl.search =
    incomingUrl.search;

  const cookieHeader =
    request.headers.get("cookie");

  let apiRes: Response;

  try {
    apiRes = await fetch(
      callbackUrl.toString(),
      {
        method: "GET",
        headers: {
          Accept: "application/json",

          // Critical for reauth:
          // this forwards the existing
          // GermFx access cookie so FastAPI
          // can resolve current_user.
          ...(cookieHeader
            ? {
                Cookie:
                  cookieHeader,
              }
            : {}),
        },
        cache: "no-store",
        redirect: "manual",
      },
    );
  } catch {
    const response =
      buildOAuthErrorRedirect(
        request,
        "GOOGLE_OAUTH_UNAVAILABLE",
      );

    clearReauthReturnCookie(
      request,
      response,
    );

    return response;
  }

  if (!apiRes.ok) {
    const errorCode =
      await getOAuthErrorCode(apiRes);

    const response =
      buildOAuthErrorRedirect(
        request,
        errorCode,
      );

    // Mutate Next-owned cookies before forwarding any FastAPI cookies.
    clearReauthReturnCookie(
      request,
      response,
    );

    appendSetCookies(
      response,
      apiRes.headers,
    );

    return response;
  }

  let data: {
    action?: string;
    registration_required?: boolean;
    reauthenticated?: boolean;
    reactivated?: boolean;
  };

  try {
    data = await apiRes.json();
  } catch {
    const response =
      buildOAuthErrorRedirect(
        request,
        "GOOGLE_OAUTH_ERROR",
      );

    // Mutate Next-owned cookies before forwarding any FastAPI cookies.
    clearReauthReturnCookie(
      request,
      response,
    );

    appendSetCookies(
      response,
      apiRes.headers,
    );

    return response;
  }

  if (
    data.action ===
      "registration_required" ||
    data.registration_required === true
  ) {
    const response =
      NextResponse.redirect(
        new URL(
          "/register/google",
          request.url,
        ),
        302,
      );

    appendSetCookies(
      response,
      apiRes.headers,
    );

    return response;
  }

  if (
    data.action === "reactivated" ||
    data.reactivated === true
  ) {
    const response =
      NextResponse.redirect(
        new URL(
          CLIENT_PATHS.homePath(),
          request.url,
        ),
        302,
      );

    // FastAPI reactivated the account and issued a completely fresh
    // GermFx access/refresh session. Forward both cookies to the browser.
    // Mutate Next-owned cookies before forwarding any FastAPI cookies.
    clearReauthReturnCookie(
      request,
      response,
    );

    appendSetCookies(
      response,
      apiRes.headers,
    );

    return response;
  }

  if (
    data.action === "reauthenticated" ||
    data.reauthenticated === true
  ) {
    const returnUrl =
      getSafeReauthReturnUrl(request);

    returnUrl.searchParams.set(
      "reauth",
      "success",
    );

    const response =
      NextResponse.redirect(
        returnUrl,
        302,
      );

    // This includes the short-lived
    // germfx_recent_auth cookie issued
    // by FastAPI.
    // Mutate Next-owned cookies before forwarding any FastAPI cookies.
    clearReauthReturnCookie(
      request,
      response,
    );

    appendSetCookies(
      response,
      apiRes.headers,
    );

    return response;
  }

  const response =
    NextResponse.redirect(
      new URL(
        CLIENT_PATHS.homePath(),
        request.url,
      ),
      302,
    );

  clearReauthReturnCookie(
    request,
    response,
  );

  // FastAPI access/refresh cookies must be appended after all NextResponse
  // cookie mutations or they can be lost.
  appendSetCookies(
    response,
    apiRes.headers,
  );

  return response;
}