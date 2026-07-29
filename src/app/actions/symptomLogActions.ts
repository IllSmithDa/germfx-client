"use server";

import { SERVER_PATHS } from "@/config/paths";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { fetchWithRefresh } from "@/lib/server/fetchWithRefresh";

type CookieLike = { name: string; value: string };


export type SymptomLogActionResult<T = null> = {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
};

async function authHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c: CookieLike) => `${c.name}=${c.value}`)
    .join("; ");

  return {
    "Content-Type": "application/json",
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

export type EditSymptomOutput = {
  user_id: number | string;
  symptom_log_id: number | string;

  // Patchable fields (send only what you want to change)
  date?: string | null; // "YYYY-MM-DD"
  symptom_text?: string | null;
  details?: string | null;
  severity?: number | null;
  user_medication_id?: string | number | null;
  possible_trigger?: string | null;
  management_strategy?: string | null;

  // only if your backend supports it
  symptom_id?: number | null;
}

export async function createUserSymptomLogs(input: {
  entries: Array<{
    symptom_text: string;
    details?: string | null;
    severity?: number | null;
    user_medication_id?: number | null;
    dateISO: string;
    possible_trigger?: string | null;
    management_strategy?: string | null;
  }>;
}) {

  // ✅ BULK ROUTE expects a LIST at the body root
  const bulkPayload = input.entries.map((e) => ({
    date: e.dateISO,
    symptom_text: e.symptom_text,
    details: (e.details ?? "").trim() || null,
    severity: e.severity ?? null,
    user_medication_id: e.user_medication_id ?? null,
    possible_trigger: e.possible_trigger ?? null,
    management_strategy: e.management_strategy ?? null,
  }));
  const url = SERVER_PATHS.userSymptomLogsBulk();

  const res = await fetchWithRefresh(url, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(bulkPayload), // ✅ send list, not object
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to create symptom logs (${res.status})`);
  }

  revalidatePath("/home");
  revalidatePath("/symptom-logs");
  return res.data;
}


// ✅ NEW: update a single symptom log
export async function updateUserSymptomLog(input: EditSymptomOutput) {

  const logId = input.symptom_log_id;

  const url = SERVER_PATHS.editUserSymptomLog(logId);

  // Build PATCH body (omit undefined)
  const patchPayload: Record<string, unknown> = {};
  if (input.date !== undefined) patchPayload.date = input.date;
  if (input.symptom_text !== undefined)
    patchPayload.symptom_text = (input.symptom_text ?? "").trim() || null;

  if (input.details !== undefined)
    patchPayload.details = (input.details ?? "").trim() || null;

  if (input.severity !== undefined) patchPayload.severity = input.severity;
  if (input.user_medication_id !== undefined) patchPayload.user_medication_id = input.user_medication_id;
  if (input.symptom_id !== undefined) patchPayload.symptom_id = input.symptom_id;
  if (input.possible_trigger !== undefined) patchPayload.possible_trigger = (input.possible_trigger ?? "").trim() || null;
  if (input.management_strategy !== undefined) patchPayload.management_strategy = (input.management_strategy ?? "").trim() || null;

  const res = await fetchWithRefresh(url, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(patchPayload),
    cache: "no-store",
  });
  console.log(res);
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: res.error
    }
  }

  // refresh whatever page shows your logs
  revalidatePath("/symptom-logs");
  revalidatePath("/home");
  return {
    ok: true,
    data: res.data,
    status: res.status
  };
}


export async function deleteUserSymptomLog(args: {
  symptom_log_id: number | string;
}){
  const {symptom_log_id } = args;

  const res = await fetchWithRefresh(
    SERVER_PATHS.deleteUserSymptomLog(symptom_log_id),
    {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: `Server Error: Failed to delete symptom log`,
    }
  }
  revalidatePath("/home");
  revalidatePath("/symptom-logs");
  return { ok: true };

}