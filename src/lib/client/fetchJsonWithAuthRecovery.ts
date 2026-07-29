// src/lib/client/fetchJsonWithAuthRecovery.ts
import { fetchWithAuthRecovery } from "./fetchWithAuthRecovery";

/*

Why client-side recovery helps

On the server, refresh can update cookies for the next request, but the current render is already using the old request cookies.

On the client, the browser is the one making the request, so when /api/auth/refresh returns new Set-Cookie headers, the browser applies them immediately. Then you can retry the failed request right away.

That makes this flow much more reliable:

protected request fails with 401
browser calls /api/auth/refresh
browser stores new cookies
browser retries the original request
UI continues normally

*/

export async function fetchJsonWithAuthRecovery<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetchWithAuthRecovery(input, init);

  if (!response.ok) {
    let message = "Something went wrong.";
    try {
      const data = await response.json();
      if (typeof data?.detail === "string") message = data.detail;
      else if (typeof data?.message === "string") message = data.message;
    } catch {}
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}