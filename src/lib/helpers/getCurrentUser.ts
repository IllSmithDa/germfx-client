// src/lib/getCurrentUser.ts
import { SERVER_PATHS } from "@/config/paths";
import { fetchWithRefresh } from "@/lib/server/fetchWithRefresh";

export type CurrentUserSubscription = {
  plan?: string | null;
  status?: string | null;
  is_plus?: boolean | null;
  is_active_paid?: boolean | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
};

export type CurrentUser = {
  id: number;
  username: string;
  email: string | null;

  is_active?: boolean | null;
  is_email_verified?: boolean | null;
  account_status?: string | null;
  created_at?: string | null;
  role?: string | null;

  subscription?: CurrentUserSubscription | null;

  // Flattened convenience fields from /auth/me
  is_plus?: boolean | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const result = await fetchWithRefresh<CurrentUser>(
    SERVER_PATHS.userDetails,
    {
      method: "GET",
    }
  );

  if (!result.ok || !result.data) {
    return null;
  }

  return result.data as CurrentUser;
}