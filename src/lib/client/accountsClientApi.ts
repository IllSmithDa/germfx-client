// src/lib/client/accountClientApi.ts

import { fetchJsonWithAuthRecovery } from "@/lib/client/fetchJsonWithAuthRecovery";

import {
  ChangeEmailPayload,
  ChangePasswordPayload,
  AccountActionResult,
} from "@/types";

type ApiDetail =
  | string
  | {
      message?: string;
      detail?: string;
      code?: string;
    }
  | Array<{
      msg?: string;
      message?: string;
    }>;

type MessageResponse = {
  message?: string;
  detail?: ApiDetail;
  error?: string;
};

const CHANGE_EMAIL_PROXY_PATH = "/api/backend/auth/change-email";
const CHANGE_PASSWORD_PROXY_PATH = "/api/backend/auth/change-password";
const VERIFY_EMAIL_CHANGE_PROXY_PATH = "/api/auth/verify-email-change";

function getMessage(data: MessageResponse | undefined, fallback: string) {
  if (!data) {
    return fallback;
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  if (
    data.detail &&
    typeof data.detail === "object" &&
    !Array.isArray(data.detail)
  ) {
    if (typeof data.detail.message === "string" && data.detail.message.trim()) {
      return data.detail.message;
    }

    if (typeof data.detail.detail === "string" && data.detail.detail.trim()) {
      return data.detail.detail;
    }
  }

  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const firstMessage = data.detail.find(
      (item) => item.message || item.msg,
    );

    if (firstMessage?.message) {
      return firstMessage.message;
    }

    if (firstMessage?.msg) {
      return firstMessage.msg;
    }
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  return fallback;
}

async function safeJson(response: Response): Promise<MessageResponse | undefined> {
  try {
    return (await response.json()) as MessageResponse;
  } catch {
    return undefined;
  }
}

/**
 * Requests an email change.
 *
 * This no longer means the email was changed immediately.
 * The backend should send a verification email to the new address.
 * The actual email update happens only after the verification link is opened.
 */
export async function changeEmailClient(
  payload: ChangeEmailPayload,
): Promise<AccountActionResult> {
  try {
    const data = await fetchJsonWithAuthRecovery<MessageResponse>(
      CHANGE_EMAIL_PROXY_PATH,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    return {
      ok: true,
      message: getMessage(
        data,
        "Verification email sent. Please check your new email address to complete the change.",
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to request email change.",
    };
  }
}

/**
 * Verifies an email-change token from the public verification page.
 *
 * This should not use auth recovery because the endpoint is allowed to work
 * even when the user is not logged in. credentials: "include" is still useful
 * because if the user is logged in, the proxy/backend can clear auth cookies.
 */
export async function verifyEmailChangeClient(
  token: string,
): Promise<AccountActionResult> {
  if (!token) {
    return {
      ok: false,
      message: "Missing email change verification token.",
    };
  }

  try {
    const response = await fetch(
      `${VERIFY_EMAIL_CHANGE_PROXY_PATH}?token=${encodeURIComponent(token)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
        cache: "no-store",
      },
    );

    const data = await safeJson(response);

    if (!response.ok) {
      return {
        ok: false,
        message: getMessage(
          data,
          "Unable to verify this email change link.",
        ),
      };
    }

    return {
      ok: true,
      message: getMessage(
        data,
        "Email changed successfully. Please log in again with your new email.",
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to verify this email change link.",
    };
  }
}

export async function changePasswordClient(
  payload: ChangePasswordPayload,
): Promise<AccountActionResult> {
  try {
    const data = await fetchJsonWithAuthRecovery<MessageResponse>(
      CHANGE_PASSWORD_PROXY_PATH,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    return {
      ok: true,
      message: getMessage(
        data,
        "Password changed successfully. Please log in again.",
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update password.",
    };
  }
}