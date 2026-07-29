import { SERVER_PATHS } from "@/config/paths";
import { fetchWithRefresh } from "@/lib/server/fetchWithRefresh";

export type SessionUser = {
  id: number;
  username: string;
  email: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  account_status?: string | null;
  created_at?: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const result = await fetchWithRefresh<SessionUser>(SERVER_PATHS.me, {
    method: "GET",
    credentials: "include",
  });
  // console.log(`status: ${result.status}`)
  // console.log(`attempted user response: ${result?.error}`)
  return result.ok && result.data ? result.data as SessionUser : null;
}