import { SERVER_PATHS } from "@/config/paths";
import { cookies } from "next/headers";
import { fetchWithRefresh } from "./fetchWithRefresh";

type CookieLike = { name: string; value: string };

export async function fetchRecentSymptomNames(
  limit = 10
): Promise<string[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c: CookieLike) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetchWithRefresh(
    SERVER_PATHS.userRecentSymptomNames(safeLimit),
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    }
  );

  if (!res.ok) {
    console.error("fetchRecentSymptomNames failed", res.status);
    return [];
  }

  const json = (await res.data) as string[];
  return Array.isArray(json) ? json : [];
}