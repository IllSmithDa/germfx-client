import {
  API_PROXY_PATHS,
} from "@/config/paths";
import {
  ClientResult,
  SetPasswordFormValues,
} from "@/types/accountSettings";
import {
  normalizeClientResult,
} from "../helpers/accountSettings";

type UnknownRecord = Record<
  string,
  unknown
>;

export type RecentAuthStatus = {
  verified: boolean;
  provider: string;
  expires_at: number | null;
  has_password: boolean;
  eligible_for_set_password: boolean;
};

export type RecentAuthStatusResult =
  | {
      ok: true;
      data: RecentAuthStatus;
    }
  | {
      ok: false;
      status: number;
      code: string | null;
      message: string;
    };

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

function getBoolean(
  value: unknown,
): boolean | undefined {
  return typeof value === "boolean"
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

export async function getRecentAuthStatusClient(): Promise<RecentAuthStatusResult> {
  try {
    const response = await fetch(
      API_PROXY_PATHS.recentAuthStatus(),
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    const dataRecord =
      isRecord(data)
        ? data
        : null;

    if (response.ok) {
      const verified =
        getBoolean(
          dataRecord?.verified,
        );
      const provider =
        getString(
          dataRecord?.provider,
        );
      const hasPassword =
        getBoolean(
          dataRecord?.has_password,
        );
      const eligibleForSetPassword =
        getBoolean(
          dataRecord?.eligible_for_set_password,
        );

      if (
        verified === undefined ||
        provider === undefined ||
        hasPassword === undefined ||
        eligibleForSetPassword ===
          undefined
      ) {
        return {
          ok: false,
          status: response.status,
          code:
            "INVALID_RECENT_AUTH_RESPONSE",
          message:
            "Unable to verify your recent authentication status.",
        };
      }

      return {
        ok: true,
        data: {
          verified,
          provider,
          expires_at:
            getNumber(
              dataRecord?.expires_at,
            ) ?? null,
          has_password:
            hasPassword,
          eligible_for_set_password:
            eligibleForSetPassword,
        },
      };
    }

    const detail =
      dataRecord?.detail;

    if (typeof detail === "string") {
      return {
        ok: false,
        status: response.status,
        code: null,
        message: detail,
      };
    }

    const detailRecord =
      isRecord(detail)
        ? detail
        : null;

    return {
      ok: false,
      status: response.status,
      code:
        getString(
          detailRecord?.code,
        ) ?? null,
      message:
        getString(
          detailRecord?.message,
        ) ??
        "Google verification is required.",
    };
  } catch {
    return {
      ok: false,
      status: 0,
      code: "NETWORK_ERROR",
      message:
        "Unable to check your verification status. Please try again.",
    };
  }
}

export async function setPasswordClient(
  payload: SetPasswordFormValues,
): Promise<ClientResult> {
  try {
    const response = await fetch(
      API_PROXY_PATHS.setPassword(),
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload,
        ),
      },
    );

    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return normalizeClientResult(
      response,
      data,
      response.ok
        ? "GermFx password set successfully. Please log in again."
        : "Unable to set password.",
    );
  } catch {
    return {
      ok: false,
      message:
        "Network error. Please try again.",
    };
  }
}