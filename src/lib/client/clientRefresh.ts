export async function refreshSession() {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  return response.ok;
}

export async function fetchWithClientRefresh(
  input: RequestInfo | URL,
  init?: RequestInit
) {
  let response = await fetch(input, {
    ...init,
    credentials: "include",
  });

  if (response.status === 401) {
    const refreshed = await refreshSession();

    if (refreshed) {
      response = await fetch(input, {
        ...init,
        credentials: "include",
      });
    }
  }

  return response;
}