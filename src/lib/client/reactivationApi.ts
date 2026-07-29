import { SERVER_PATHS } from "@/config/paths";

export type ReactivateAccountPayload = {
  identifier: string;
  password: string;
};

export type ApiResult = {
  ok: boolean;
  message: string;
};

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;

    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      return data.detail
        .map((item: { msg?: string }) => item.msg)
        .filter(Boolean)
        .join(", ");
    }
  } catch {}

  return "Something went wrong. Please try again.";
}

export async function reactivateAccountClient(
  payload: ReactivateAccountPayload
): Promise<ApiResult> {
  const response = await fetch(SERVER_PATHS.reactivateAccount, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return {
      ok: false,
      message: await getErrorMessage(response),
    };
  }

  const data = await response.json().catch(() => ({}));

  return {
    ok: true,
    message:
      data?.message ?? data?.detail ?? "Account reactivated successfully.",
  };
}