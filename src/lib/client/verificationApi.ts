import { SERVER_PATHS } from "@/config/paths";

export type ResendVerificationPayload = {
  email: string;
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

export async function resendVerificationClient(
  payload: ResendVerificationPayload
): Promise<ApiResult> {
  const response = await fetch(SERVER_PATHS.resendVerification, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return {
      ok: false,
      message: await getErrorMessage(response),
    };
  }

  return {
    ok: true,
    message: "Verification email sent. Please check your inbox.",
  };
}