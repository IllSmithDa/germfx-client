// src/app/api/reports/[userId]/export/pdf/route.ts

import { NextRequest, NextResponse } from "next/server";

import { SERVER_PATHS } from "@/config/paths";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

function parseIntegerQuery(
  value: string | null,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  if (value == null) return fallback;

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(Math.max(parsed, minimum), maximum);
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const { userId } = await context.params;

  const days = parseIntegerQuery(
    request.nextUrl.searchParams.get("days"),
    30,
    1,
    365,
  );

  const topSymptomLimit = parseIntegerQuery(
    request.nextUrl.searchParams.get("top_symptom_limit"),
    5,
    1,
    15,
  );

  const backendUrl = SERVER_PATHS.pdfExportRoute(
    userId,
    days,
    topSymptomLimit,
  );

  const cookieHeader = request.headers.get("cookie");
  const authorizationHeader = request.headers.get("authorization");

  try {
    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/pdf, application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...(authorizationHeader
          ? { Authorization: authorizationHeader }
          : {}),
      },
      cache: "no-store",
    });

    const body = await backendResponse.arrayBuffer();
    const responseHeaders = new Headers();

    const forwardedHeaders = [
      "content-type",
      "content-disposition",
      "content-length",
      "x-usage-feature",
      "x-usage-unlimited",
      "x-usage-count",
      "x-usage-limit",
      "x-usage-remaining",
    ];

    for (const headerName of forwardedHeaders) {
      const value = backendResponse.headers.get(headerName);

      if (value) {
        responseHeaders.set(headerName, value);
      }
    }

    responseHeaders.set("Cache-Control", "no-store");

    return new Response(body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Report PDF proxy error:", error);

    return NextResponse.json(
      {
        detail: {
          message: "Unable to reach the report export service.",
          code: "REPORT_EXPORT_PROXY_FAILED",
        },
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}