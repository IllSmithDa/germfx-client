// src/lib/server/accountServerApi.ts
import { cookies } from "next/headers";
import { SERVER_PATHS } from "@/config/paths";
import { ChangeUsernamePayload } from "@/types";
import { fetchWithRefresh } from "./fetchWithRefresh";

export type AccountApiResult<T> = {
  ok: boolean;
  data: T | null;
  error?: string;
  status?: number;
};

export async function changeUsernameRequest(
  payload: ChangeUsernamePayload
) {
  const cookieStore = await cookies();

  const response = await fetchWithRefresh(SERVER_PATHS.changeUsername, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieStore.toString(),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {

  return {
    ok: false,
    data: null,
    status: response.status,
    error:
      response.error ||
      "Failed to fetch account information.",
  };
}

  return {
    data: response.data,
    ok: true,
    status: response.status,
    message: "Username has been successfully updated."
  }
}