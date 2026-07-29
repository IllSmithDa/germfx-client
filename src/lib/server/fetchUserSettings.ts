// src/lib/server/fetchUserSettings.ts

import { cookies } from "next/headers";
import { SERVER_PATHS } from "@/config/paths";
import type { UserSettings } from "@/lib/client/userSettingsApi"
import { fetchWithRefresh } from "./fetchWithRefresh";

export const DEFAULT_USER_SETTINGS: UserSettings = {
  id: 0,
  user_id: 0,
  theme: "system",
  default_report_range: "30d",
  top_symptom_limit: 10,
  remember_last_medication: false,
  recent_suggestions_first: true,
  default_recall_state: "all",
  default_recall_type: "all",
};

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

export async function fetchUserSettings(): Promise<UserSettings> {
  try {
    const response = await fetchWithRefresh(SERVER_PATHS.userSettings, {
      method: "GET",
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (!response.ok) return DEFAULT_USER_SETTINGS;

    return response.data as UserSettings;
  } catch {
    return DEFAULT_USER_SETTINGS;
  }
}