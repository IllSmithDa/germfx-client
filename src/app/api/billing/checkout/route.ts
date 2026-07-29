import { NextRequest, NextResponse } from "next/server";

import { SERVER_PATHS } from "@/config/paths";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const apiRes = await fetch(SERVER_PATHS.billingCheckout, {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
      Accept: "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
    body,
    cache: "no-store",
  });

  const text = await apiRes.text();

  return new NextResponse(text, {
    status: apiRes.status,
    headers: {
      "Content-Type": apiRes.headers.get("content-type") ?? "application/json",
    },
  });
}