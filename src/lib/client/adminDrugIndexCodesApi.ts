import type {
  AdminDrugIndexItem,
} from "@/lib/server/fetchAdminDrugIndexes";


export type UpdateDrugIndexCodesPayload = {
  add_upc_codes?: string[];
  add_ndc_codes?: string[];
  remove_upc_codes?: string[];
  remove_ndc_codes?: string[];
};

export type UpdateDrugIndexCodesResult =
  | {
      ok: true;
      data: AdminDrugIndexItem;
      error: null;
      status: number;
    }
  | {
      ok: false;
      data: null;
      error: string;
      status: number;
    };

async function getErrorMessage(
  response: Response
) {
  try {
    const data =
      await response.json();

    if (
      typeof data?.detail ===
      "string"
    ) {
      return data.detail;
    }

    if (
      typeof data?.message ===
      "string"
    ) {
      return data.message;
    }

    if (
      typeof data?.error ===
      "string"
    ) {
      return data.error;
    }
  } catch {}

  return "Unable to update drug index codes.";
}

export async function updateDrugIndexCodesRequest(
  drugIndexId: number | string,
  payload: UpdateDrugIndexCodesPayload
): Promise<UpdateDrugIndexCodesResult> {
  try {
    const response = await fetch(
      `/api/admin/drug-indexes/${encodeURIComponent(
        String(drugIndexId)
      )}/codes`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      return {
        ok: false,
        data: null,
        status: response.status,
        error:
          await getErrorMessage(
            response
          ),
      };
    }

    const data =
      (await response.json()) as AdminDrugIndexItem;

    return {
      ok: true,
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      status: 500,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update drug index codes.",
    };
  }
}