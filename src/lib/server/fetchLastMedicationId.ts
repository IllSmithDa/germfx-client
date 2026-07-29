// src/lib/server/fetchLastUsedMedicationId.ts

import { cookies } from "next/headers";
import { SERVER_PATHS } from "@/config/paths";
import { fetchWithRefresh } from "./fetchWithRefresh";

async function authHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return {
    Accept: "application/json",
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

export async function fetchLastUsedMedicationId(): Promise<number | null> {
  try {
    const response = await fetchWithRefresh(SERVER_PATHS.lastUsedMedicationId(), {
      method: "GET",
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = (await response.data) as {
      user_medication_id?: number | string | null;
    };

    if (data.user_medication_id == null) return null;

    return Number(data.user_medication_id);
  } catch {
    return null;
  }
}