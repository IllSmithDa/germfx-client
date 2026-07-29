"use server";

import { SERVER_PATHS } from "@/config/paths";
import { revalidatePath } from "next/cache";
import { MedicationFormValues } from "@/components/UserMedicationForm/UserMedicationForm";
import { UserMedication, UserMedicationPayload } from "@/types/userMedication";
import { fetchWithRefresh } from "@/lib/server/fetchWithRefresh";

export type MedicationActionResult<T = null> = {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
};

function resolvePreset(
  preset: string | null | undefined,
  other: string | null | undefined
): string | null {
  const p = (preset ?? "").trim();
  const o = (other ?? "").trim();

  if (!p) return null;

  if (p === "Other") {
    return o || "Other";
  }

  return p;
}

function getActionError(
  result: {
    status?: number;
    error?: string;
    data?: unknown;
  },
  fallback: string
) {
  if (result.error) return result.error;

  if (
    result.data &&
    typeof result.data === "object" &&
    "detail" in result.data
  ) {
    const detail = (result.data as { detail?: unknown }).detail;

    if (typeof detail === "string") return detail;

    try {
      return JSON.stringify(detail);
    } catch {
      return fallback;
    }
  }

  if (result.status) {
    return `${fallback} Status: ${result.status}`;
  }

  return fallback;
}

/* ---------------- ADD ---------------- */

export async function addUserMedication(
  args: UserMedicationPayload
) {
  const frequency = resolvePreset(args.frequency_preset, args.frequency_other);
  const route = resolvePreset(args.route_preset, args.route_other);

  const createPayload = {
    drug_index_id: args.drug_index_id,
    drug_detail_id: args.drug_detail_id,
    name: args.name,
    is_active: args.is_active,
    start_date: args.start_date ?? null,
    end_date: args.end_date ?? null,
    nickname: (args.nickname ?? "").trim() || null,
    notes: (args.notes ?? "").trim() || null,
    dosage: (args.dosage ?? "").trim() || null,
    frequency,
    route,
    tracking_purpose: args.tracking_purpose ?? null
  };

  const result = await fetchWithRefresh<UserMedication>(
    SERVER_PATHS.userMedications(),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
      cache: "no-store",
    }
  );

  if (!result.ok || !result.data) {
    console.log("Add medication failed:", result);
    return {
      ok: false,
      status: result.status,
      error: getActionError(result, "Failed to add medication."),
    };
  }

  revalidatePath("/home");
  revalidatePath("/user-medications");

  return {
    ok: true,
    data: result.data,
  };
}

/* ---------------- REMOVE ---------------- */

export async function removeUserMedication(args: {
  drug_detail_id: number | string;
}): Promise<MedicationActionResult> {
  const result = await fetchWithRefresh(
    SERVER_PATHS.userMedicationByDetail(args.drug_detail_id),
    {
      method: "DELETE",
      cache: "no-store",
    }
  );

  if (!result.ok) {
    return {
      ok: false,
      status: result.status,
      error: getActionError(result, "Failed to remove medication."),
    };
  }

  revalidatePath("/home");
  revalidatePath("/user-medications");

  return { ok: true };
}

export async function removeUserMedicationById(
id: number | string): Promise<MedicationActionResult> {
  const result = await fetchWithRefresh(
    SERVER_PATHS.deleteUserMedicationsById(id),
    {
      method: "DELETE",
      cache: "no-store",
    }
  );

  if (!result.ok) {
    return {
      ok: false,
      status: result.status,
      error: getActionError(result, "Failed to remove medication."),
    };
  }

  revalidatePath("/home");
  revalidatePath("/user-medications");

  return { ok: true };
}

/* ---------------- UPDATE ---------------- */

export async function updateUserMedication(
  input: {
    user_medication_id: number | string;
  } & MedicationFormValues
): Promise<MedicationActionResult> {
  const { user_medication_id, ...payload } = input;

  const frequency = resolvePreset(
    payload.frequency_preset,
    payload.frequency_other
  );
  const route = resolvePreset(payload.route_preset, payload.route_other);

  const patchPayload = {
    is_active: payload.is_active,
    start_date: payload.start_date ?? null,
    end_date: payload.end_date ?? null,
    nickname: (payload.nickname ?? "").trim() || null,
    notes: (payload.notes ?? "").trim() || null,
    dosage: (payload.dosage ?? "").trim() || null,
    frequency,
    route,
    tracking_purpose: payload.tracking_purpose ?? null
  };

  const result = await fetchWithRefresh(
    SERVER_PATHS.editUserMedication(user_medication_id),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchPayload),
      cache: "no-store",
    }
  );

  if (!result.ok) {
    console.log(result.status, result.error, result.data);

    return {
      ok: false,
      status: result.status,
      error: getActionError(result, "Failed to update medication."),
    };
  }

  revalidatePath("/home");
  revalidatePath("/user-medications");

  return { ok: true };
}