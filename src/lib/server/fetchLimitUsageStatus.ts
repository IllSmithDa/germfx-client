import { cookies } from "next/headers";

import { SERVER_PATHS } from "@/config/paths";
import { fetchWithRefresh } from "./fetchWithRefresh";

export type UsageFeatureKey =
  | "user_medications"
  | "symptom_logs"
  | "saved_items"
  | "pdf_downloads";

export type UsageLimitStatus = {
  feature_key: UsageFeatureKey | string;
  unlimited: boolean;
  should_show: boolean;
  current_count: number | null;
  limit: number | null;
  remaining: number | null;
  limit_reached: boolean;
};

async function getCookieHeader() {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export async function fetchUsageLimitStatus(
  featureKey: UsageFeatureKey,
): Promise<UsageLimitStatus | null> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await fetchWithRefresh(SERVER_PATHS.usageLimitStatus(featureKey), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.data) as UsageLimitStatus;

    return data.should_show ? data : null;
  } catch {
    return null;
  }
}