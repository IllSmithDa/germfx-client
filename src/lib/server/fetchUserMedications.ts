import { SERVER_PATHS } from "@/config/paths";
import { cookies } from "next/headers";
import type { UserMedication, UserMedicationSort } from "@/types/userMedication";
import { fetchWithRefresh } from "./fetchWithRefresh";

type ApiMedicationList = {
  items: Array<{
    id: number | string;
    name?: string | null;
    notes?: string | null;
    dosage?: string | null;
    route?: string | null;
    nickname?: string | null;
    frequency?: string | null;
    start_date: string;
    end_date?: string | null;
    is_active: boolean;
    created_at: string;
    drug_detail_id?: number | string;
    drug_index_id?: number | string;
    user_id: number | string;
    tracking_purpose: string | null;
  }>;
  total: number;
};

function mapMedications(api: ApiMedicationList["items"]): UserMedication[] {
  return api.map((row) => ({
    id: row.id ?? 0,
    name: row.name ?? "Medication",
    user_id: row.user_id,
    drug_detail_id: row.drug_detail_id ?? 0,
    drug_index_id: row.drug_index_id ?? 0,
    start_date: row.start_date,
    end_date: row.end_date,
    is_active: row.is_active,
    notes: row.notes ?? undefined,
    nickname: row.nickname ?? undefined,
    dosage: row.dosage ?? undefined,
    frequency: row.frequency ?? undefined,
    route: row.route ?? undefined,
    tracking_purpose: row.tracking_purpose ?? undefined
  }));
}

export async function fetchUserMedications(
  limit = 10,
  options?: {
    offset?: number;
    q?: string;
    active?: boolean;
    sort?: UserMedicationSort;
  }
): Promise<UserMedication[]> {

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const url = SERVER_PATHS.userMedications({
      limit,
      offset: options?.offset ?? 0,
      q: options?.q,
      active: options?.active,
      sort: options?.sort,
    });

  const res = await fetchWithRefresh(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });

  if (!res.ok) {
    console.error("fetchUserMedications failed", res.status, await res.data);
    return [];
  }

  const json = (await res.data) as ApiMedicationList;
  return mapMedications(json.items ?? []);
}

export async function fetchUserMedicationsPage(
  params?: {
    limit?: number;
    offset?: number;
    q?: string;
    active?: boolean;
    sort?: UserMedicationSort;
  }
){

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const url = SERVER_PATHS.userMedications({
      limit: params?.limit ?? 10,
      offset: params?.offset ?? 0,
      q: params?.q,
      active: params?.active,
      sort: params?.sort,
    });

  const res = await fetchWithRefresh(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });

  if (!res.ok) {
    return{
      items: [],
      total: 0,
    };
  } 

  const json = (await res.data) as ApiMedicationList;
  return {
    items: mapMedications(json.items ?? []),
    total: json.total ?? 0,
  };
}