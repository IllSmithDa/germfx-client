// src/lib/fetchWithAuth.ts
// import { SERVER_PATHS } from "@/config/paths";

const NEXT_REFRESH = "/api/auth/refresh"; // our proxy route above

export async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  // always send cookies
  let res = await fetch(input, { credentials: "include", ...init });
  if (res.status !== 401) return res;

  // try to refresh (proxy ensures Set-Cookie reaches browser)
  const ref = await fetch(NEXT_REFRESH, { method: "POST", credentials: "include" });
  if (!ref.ok) return res;

  // retry original once
  res = await fetch(input, { credentials: "include", ...init });
  return res;
}
