import { NextRequest, NextResponse } from "next/server";

import { SERVER_PATHS } from "@/config/paths";

export const dynamic = "force-dynamic";

function getForwardedHeaders(request: NextRequest) {
  const headers = new Headers();

  headers.set("Accept", "application/pdf, application/json");

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

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      drugDetailId: string;
    }>;
  },
) {
  const { drugDetailId } = await context.params;

  const backendResponse = await fetch(SERVER_PATHS.pdfDrugDetails(drugDetailId), {
    method: "GET",
    headers: getForwardedHeaders(request),
    cache: "no-store",
  });

  const contentType = backendResponse.headers.get("content-type") ?? "";

  if (!backendResponse.ok) {
    if (contentType.includes("application/json")) {
      const data = await safeJson(backendResponse);

      return NextResponse.json(data ?? {
        detail: {
          message: "Failed to download PDF.",
          code: "PDF_DOWNLOAD_FAILED",
        },
      }, {
        status: backendResponse.status,
      });
    }

    const text = await backendResponse.text().catch(() => "");

    return NextResponse.json(
      {
        detail: {
          message: text || "Failed to download PDF.",
          code: "PDF_DOWNLOAD_FAILED",
        },
      },
      {
        status: backendResponse.status,
      },
    );
  }

  const pdfBytes = await backendResponse.arrayBuffer();

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        backendResponse.headers.get("content-disposition") ??
        `attachment; filename="drug-detail-${drugDetailId}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}