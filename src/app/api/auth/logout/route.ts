import {
  NextResponse,
} from "next/server";

import {
  cookies,
} from "next/headers";

import {
  SERVER_PATHS,
} from "@/config/paths";

function getCookieHeader(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  return cookieStore
    .getAll()
    .map(
      (cookie) =>
        `${cookie.name}=${cookie.value}`
    )
    .join("; ");
}

function clearAuthCookies(
  response: NextResponse
) {
  const cookieOptions = {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure:
      process.env.NODE_ENV ===
      "production",
    maxAge: 0,
  };

  response.cookies.set(
    "access_token",
    "",
    cookieOptions
  );

  response.cookies.set(
    "refresh_token",
    "",
    cookieOptions
  );
}

export async function POST() {
  const cookieStore =
    await cookies();

  const cookieHeader =
    getCookieHeader(cookieStore);

  let backendStatus:
    | number
    | null = null;

  let backendOk = false;

  try {
    const backendResponse =
      await fetch(
        SERVER_PATHS.logout,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Cookie: cookieHeader,
          },
          cache: "no-store",
        }
      );

    backendStatus =
      backendResponse.status;

    backendOk =
      backendResponse.ok;
  } catch {
    backendOk = false;
  }

  const response =
    NextResponse.json(
      {
        ok: true,
        backendOk,
        backendStatus,
      },
      {
        status: 200,
      }
    );

  clearAuthCookies(response);

  return response;
}