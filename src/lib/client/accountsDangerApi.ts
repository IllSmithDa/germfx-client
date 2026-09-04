import {
  fetchJsonWithAuthRecovery,
} from "@/lib/client/fetchJsonWithAuthRecovery";

export type ConfirmPasswordPayload = {
  current_password?: string;
};

export type DeleteAccountPayload = {
  current_password?: string;
  confirmation_text: string;
};

export type AccountDangerResult = {
  ok: boolean;
  message: string;
};

type MessageDetail = {
  message?: string;
  code?: string;
};

type MessageResponse = {
  message?: string;
  detail?: string | MessageDetail;
};

const DEACTIVATE_ACCOUNT_PROXY_PATH =
  "/api/backend/auth/deactivate-account";

const DELETE_ACCOUNT_PROXY_PATH =
  "/api/backend/auth/delete-account";

function getMessage(
  data: MessageResponse | undefined,
  fallback: string,
): string {
  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (
    data?.detail &&
    typeof data.detail === "object" &&
    typeof data.detail.message === "string"
  ) {
    return data.detail.message;
  }

  return fallback;
}

export async function deactivateAccountClient(
  payload: ConfirmPasswordPayload,
): Promise<AccountDangerResult> {
  try {
    const data =
      await fetchJsonWithAuthRecovery<MessageResponse>(
        DEACTIVATE_ACCOUNT_PROXY_PATH,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          body: JSON.stringify(
            payload,
          ),
        },
      );

    return {
      ok: true,
      message: getMessage(
        data,
        "Account deactivated successfully.",
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to deactivate account.",
    };
  }
}

export async function deleteAccountClient(
  payload: DeleteAccountPayload,
): Promise<AccountDangerResult> {
  try {
    const data =
      await fetchJsonWithAuthRecovery<MessageResponse>(
        DELETE_ACCOUNT_PROXY_PATH,
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          body: JSON.stringify(
            payload,
          ),
        },
      );

    return {
      ok: true,
      message: getMessage(
        data,
        "Account deleted successfully.",
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete account.",
    };
  }
}
