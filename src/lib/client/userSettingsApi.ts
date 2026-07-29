import {
  fetchWithClientRefresh,
} from "@/lib/client/clientRefresh";

export type ThemeValue =
  | "system"
  | "light"
  | "dark";

export type ReportRange =
  | "7d"
  | "30d"
  | "90d"
  | "all";

export type TopSymptomLimit =
  | 5
  | 10
  | 15;

export type RecallType =
  | "all"
  | "food"
  | "drug";

export type UserSettings = {
  id: number;
  user_id: number;
  theme: ThemeValue;
  default_report_range: ReportRange;
  top_symptom_limit: TopSymptomLimit;
  remember_last_medication: boolean;
  recent_suggestions_first: boolean;
  default_recall_state: string;
  default_recall_type: RecallType;
};

export type UserSettingsUpdate = Partial<{
  theme: ThemeValue;
  default_report_range: ReportRange;
  top_symptom_limit: TopSymptomLimit;
  remember_last_medication: boolean;
  recent_suggestions_first: boolean;
  default_recall_state: string;
  default_recall_type: RecallType;
}>;

export type UserSettingsApiResult<T = UserSettings> = {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
};

const USER_SETTINGS_PROXY_PATH =
  "/api/backend/user-settings";

const RESET_USER_SETTINGS_PROXY_PATH =
  "/api/backend/user-settings/reset";

async function getErrorMessage(
  response: Response,
  fallback: string
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
      Array.isArray(data?.detail)
    ) {
      const firstMessage =
        data.detail.find(
          (item: unknown) =>
            item &&
            typeof item === "object" &&
            "msg" in item
        );

      if (
        firstMessage &&
        typeof firstMessage === "object" &&
        "msg" in firstMessage &&
        typeof firstMessage.msg === "string"
      ) {
        return firstMessage.msg;
      }

      return JSON.stringify(
        data.detail
      );
    }

    if (data?.detail) {
      return JSON.stringify(
        data.detail
      );
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
  } catch {
    // ignore parse failures
  }

  return fallback;
}

export async function updateUserSettings(
  payload: UserSettingsUpdate
): Promise<UserSettingsApiResult> {
  const response =
    await fetchWithClientRefresh(
      USER_SETTINGS_PROXY_PATH,
      {
        method: "PATCH",
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
      status: response.status,
      error:
        await getErrorMessage(
          response,
          "Failed to update user settings."
        ),
    };
  }

  return {
    ok: true,
    data:
      await response.json(),
  };
}

export async function resetUserSettings(): Promise<UserSettingsApiResult> {
  const response =
    await fetchWithClientRefresh(
      RESET_USER_SETTINGS_PROXY_PATH,
      {
        method: "POST",
        headers: {
          Accept:
            "application/json",
        },
      }
    );

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        await getErrorMessage(
          response,
          "Failed to reset user settings."
        ),
    };
  }

  return {
    ok: true,
    data:
      await response.json(),
  };
}