// src/lib/client/passwordResetApi.ts

export type ForgotPasswordPayload = {
  email: string;
   turnstile_token?: string | null;
};

export type ResetPasswordPayload = {
  token: string;
  new_password: string;
  confirm_new_password: string;
};

export type ApiResult = {
  ok: boolean;
  message: string;
};

const FORGOT_PASSWORD_PROXY_PATH =
  "/api/backend/auth/forgot-password";

const RESET_PASSWORD_PROXY_PATH =
  "/api/backend/auth/reset-password";

async function getErrorMessage(
  response: Response
): Promise<string> {
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
      Array.isArray(data?.detail) &&
      data.detail.length > 0
    ) {
      return data.detail
        .map(
          (item: {
            msg?: string;
          }) => item.msg
        )
        .filter(Boolean)
        .join(", ");
    }
  } catch {
    // ignore parse failures
  }

  return "Something went wrong. Please try again.";
}

export async function forgotPasswordClient(
  payload: ForgotPasswordPayload
): Promise<ApiResult> {
  const response =
    await fetch(
      FORGOT_PASSWORD_PROXY_PATH,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Accept:
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    );

  if (!response.ok) {
    return {
      ok: false,
      message:
        await getErrorMessage(
          response
        ),
    };
  }

  const data =
    await response
      .json()
      .catch(() => ({}));

  return {
    ok: true,
    message:
      data?.detail ??
      data?.message ??
      "If an account exists for that email, a reset link has been sent.",
  };
}

export async function resetPasswordClient(
  payload: ResetPasswordPayload
): Promise<ApiResult> {
  const response =
    await fetch(
      RESET_PASSWORD_PROXY_PATH,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Accept:
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    );

  if (!response.ok) {
    return {
      ok: false,
      message:
        await getErrorMessage(
          response
        ),
    };
  }

  const data =
    await response
      .json()
      .catch(() => ({}));

  return {
    ok: true,
    message:
      data?.detail ??
      data?.message ??
      "Password reset successfully. Please log in again.",
  };
}