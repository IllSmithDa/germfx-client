import { ClientResult, SettingsGoogleAction } from "@/types/accountSettings";

export function getGoogleReauthErrorMessage(
  code: string,
) {
  const messages: Record<string, string> = {
    GOOGLE_REAUTH_ACCOUNT_MISMATCH:
      "The Google account you selected does not match the Google account linked to this GermFx account.",
    GOOGLE_REAUTH_NOT_LINKED:
      "This GermFx account is not linked to Google.",
    GOOGLE_REAUTH_AUTH_REQUIRED:
      "Your GermFx session expired. Please sign in again.",
    GOOGLE_OAUTH_DENIED:
      "Google verification was cancelled.",
    GOOGLE_OAUTH_STATE_INVALID:
      "Your Google verification session expired. Please try again.",
    GOOGLE_ID_TOKEN_INVALID:
      "Google could not verify your identity. Please try again.",
    GOOGLE_OAUTH_UNAVAILABLE:
      "Google verification is temporarily unavailable. Please try again.",
  };

  return (
    messages[code] ??
    "Unable to verify your Google account. Please try again."
  );
}

export function buildSettingsReauthReturnTo(
  action: SettingsGoogleAction,
) {
  const url = new URL(window.location.href);

  url.searchParams.set(
    "settings_action",
    action,
  );
  url.searchParams.delete("reauth");
  url.searchParams.delete("reauth_error");

  return `${url.pathname}${url.search}${url.hash}`;
}

export function getCooldownSecondsFromResult(
  result: unknown,
) {
  if (
    !result ||
    typeof result !== "object"
  ) {
    return null;
  }

  const value = result as {
    remaining_seconds?: unknown;
    retryAfterSeconds?: unknown;
    retry_after_seconds?: unknown;
  };

  if (
    typeof value.remaining_seconds ===
    "number"
  ) {
    return value.remaining_seconds;
  }

  if (
    typeof value.retryAfterSeconds ===
    "number"
  ) {
    return value.retryAfterSeconds;
  }

  if (
    typeof value.retry_after_seconds ===
    "number"
  ) {
    return value.retry_after_seconds;
  }

  return null;
}

export function formatCooldownTime(
  totalSeconds: number,
) {
  const safeSeconds = Math.max(
    0,
    Math.ceil(totalSeconds),
  );
  const minutes = Math.floor(
    safeSeconds / 60,
  );
  const seconds = safeSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

export function normalizeClientResult(
  response: Response,
  data: any,
  fallbackMessage: string,
): ClientResult {
  if (response.ok) {
    return {
      ok: true,
      message:
        data?.message ?? fallbackMessage,
      code:
        typeof data?.code === "string"
          ? data.code
          : null,
    };
  }

  const detail = data?.detail;

  return {
    ok: false,
    message:
      typeof detail === "string"
        ? detail
        : detail?.message ??
          fallbackMessage,
    code:
      typeof detail?.code === "string"
        ? detail.code
        : null,
    remaining_seconds:
      typeof detail?.remaining_seconds ===
      "number"
        ? detail.remaining_seconds
        : undefined,
    retryAfterSeconds:
      typeof detail?.retryAfterSeconds ===
      "number"
        ? detail.retryAfterSeconds
        : undefined,
    retry_after_seconds:
      typeof detail?.retry_after_seconds ===
      "number"
        ? detail.retry_after_seconds
        : undefined,
  };
}
