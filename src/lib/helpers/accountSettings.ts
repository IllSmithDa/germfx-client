import { ClientResult, SettingsGoogleAction } from "@/types/accountSettings";
type UnknownRecord = Record<string, unknown>;

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getString(
  value: unknown,
): string | undefined {
  return typeof value === "string"
    ? value
    : undefined;
}

function getNumber(
  value: unknown,
): number | undefined {
  return typeof value === "number"
    ? value
    : undefined;
}

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
  const url = new URL(
    window.location.href,
  );

  url.searchParams.set(
    "settings_action",
    action,
  );
  url.searchParams.delete("reauth");
  url.searchParams.delete(
    "reauth_error",
  );

  return `${url.pathname}${url.search}${url.hash}`;
}

export function getCooldownSecondsFromResult(
  result: unknown,
) {
  if (!isRecord(result)) {
    return null;
  }

  const remainingSeconds =
    getNumber(
      result.remaining_seconds,
    );

  if (
    remainingSeconds !== undefined
  ) {
    return remainingSeconds;
  }

  const retryAfterSeconds =
    getNumber(
      result.retryAfterSeconds,
    );

  if (
    retryAfterSeconds !== undefined
  ) {
    return retryAfterSeconds;
  }

  const retryAfterSecondsSnake =
    getNumber(
      result.retry_after_seconds,
    );

  if (
    retryAfterSecondsSnake !==
    undefined
  ) {
    return retryAfterSecondsSnake;
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
  const seconds =
    safeSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

export function normalizeClientResult(
  response: Response,
  data: unknown,
  fallbackMessage: string,
): ClientResult {
  const dataRecord =
    isRecord(data)
      ? data
      : null;

  if (response.ok) {
    return {
      ok: true,
      message:
        getString(
          dataRecord?.message,
        ) ??
        fallbackMessage,
      code:
        getString(
          dataRecord?.code,
        ) ??
        null,
    };
  }

  const detail =
    dataRecord?.detail;

  if (typeof detail === "string") {
    return {
      ok: false,
      message: detail,
      code: null,
    };
  }

  const detailRecord =
    isRecord(detail)
      ? detail
      : null;

  return {
    ok: false,
    message:
      getString(
        detailRecord?.message,
      ) ??
      fallbackMessage,
    code:
      getString(
        detailRecord?.code,
      ) ??
      null,
    remaining_seconds:
      getNumber(
        detailRecord
          ?.remaining_seconds,
      ),
    retryAfterSeconds:
      getNumber(
        detailRecord
          ?.retryAfterSeconds,
      ),
    retry_after_seconds:
      getNumber(
        detailRecord
          ?.retry_after_seconds,
      ),
  };
}
