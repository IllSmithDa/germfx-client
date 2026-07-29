// src/app/actions/account.ts
"use server";

import { revalidatePath } from "next/cache";
import { changeUsernameRequest } from '@/lib/server/accountsServerApi';
import { ChangeUsernamePayload } from '@/types';


export type AccountActionResult = {
  error ?: string;
  ok: boolean;
  message ?: string;
};
type AccountAPI = {
  ok: boolean;
  status: number | null;
  error?: string;
  message?: string;
}

export async function changeUsernameAction(
  payload: ChangeUsernamePayload
): Promise<AccountActionResult> {
  try {
    const result = await changeUsernameRequest(payload) as AccountAPI;

    if (!result?.ok) {
      return {
        ok: false,
        error: result.error ?? "Error: Username could not be changed"
      }
    }
    return {
      ok: true,
      message: "Username updated successfully.",
    };
  } finally {
    revalidatePath("/account");
  }
}
