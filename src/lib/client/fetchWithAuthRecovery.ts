// src/lib/client/fetchWithAuthRecovery.ts
let refreshPromise: Promise<boolean> | null = null;


async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function fetchWithAuthRecovery(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const doFetch = () =>
    fetch(input, {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.headers ?? {}),
      },
    });

  let response = await doFetch();

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshSession();

  if (!refreshed) {
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  response = await doFetch();

  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  return response;
}