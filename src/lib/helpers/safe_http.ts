// src/lib/http.ts
export async function safeFetchJSON<T>(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<{ ok: boolean; data?: T; status?: number; error?: string }> {
  const { timeoutMs = 6000, ...rest } = init;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...rest, signal: ac.signal });
    clearTimeout(t);
    if (!res.ok) {
      // don’t throw; return a soft failure
      return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as T;
    return { ok: true, data, status: res.status };
  } catch (e: unknown) {
    clearTimeout(t);
    let message = "Network error";
    if (e instanceof Error && e.message) {
      message = e.message;
    } else if (typeof e === "string") {
      message = e;
    }
    return { ok: false, error: message };
  }
}