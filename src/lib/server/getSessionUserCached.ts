import { cookies } from "next/headers";

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

async function buildCookieHeader() {
  const cookieStore =
    await cookies();

  return cookieStore
    .getAll()
    .map(
      (cookie: {
        name: string;
        value: string;
      }) =>
        `${cookie.name}=${cookie.value}`
    )
    .join("; ");
}
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieHeader =
    await buildCookieHeader();

  const result =
    await fetchWithRefresh<SessionUser>(
      SERVER_PATHS.me,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Cookie: cookieHeader,
        },
      }
    );

  /*
  console.log(
    `attempted user response: ${result?.error}`
  );
  */
  return result.ok && result.data
    ? (result.data as SessionUser)
    : null;
}