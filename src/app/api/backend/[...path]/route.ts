/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from "next/server";

const DEFAULT_API_BASE_URL = "http://localhost:8000/api";

const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  DEFAULT_API_BASE_URL;

type Context = {
  params: Promise<{
    path: string[];
  }>;
};

function getApiBaseUrl() {
  return API_BASE_URL.replace(/\/$/, "");
}

function copyRequestHeaders(request: NextRequest) {
  const headers = new Headers();

  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  const cookie = request.headers.get("cookie");
  const authorization = request.headers.get("authorization");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (accept) {
    headers.set("accept", accept);
  }

  if (cookie) {
    headers.set("cookie", cookie);
  }

  if (authorization) {
    headers.set("authorization", authorization);
  }

  return headers;
}

async function safeReadBody(request: NextRequest, method: string) {
  if (["GET", "HEAD"].includes(method)) {
    return undefined;
  }

  return await request.text();
}

function appendSetCookieHeaders(
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

async function proxyRequest(request: NextRequest, context: Context) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      {
        detail: "API_BASE_URL is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  const { path } = await context.params;

  const backendPath = path.join("/");
  const requestUrl = new URL(request.url);

  const backendUrl = `${getApiBaseUrl()}/${backendPath}${requestUrl.search}`;

  const method = request.method;
  const body = await safeReadBody(request, method);

  const backendResponse = await fetch(backendUrl, {
    method,
    headers: copyRequestHeaders(request),
    body: body && body.length > 0 ? body : undefined,
    cache: "no-store",
  });

  if (backendResponse.status === 204) {
    const response = new NextResponse(null, {
      status: 204,
    });

    appendSetCookieHeaders(backendResponse, response);

    return response;
  }

  const responseBody = await backendResponse.text();

  const response = new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: {
      "content-type":
        backendResponse.headers.get("content-type") ?? "application/json",
    },
  });

  appendSetCookieHeaders(backendResponse, response);

  return response;
}

export async function GET(request: NextRequest, context: Context) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: Context) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: Context) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: Context) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: Context) {
  return proxyRequest(request, context);
}