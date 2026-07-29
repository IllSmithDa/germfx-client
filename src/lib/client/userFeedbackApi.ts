import { API_PROXY_PATHS } from "@/config/paths";
import { AdminFeedbackListOut, AdminFeedbackListParams, AdminFeedbackOut, AdminFeedbackStatusUpdatePayload, SubmitFeedbackPayload, UpdateFeedbackPayload, UserFeedbackOut } from "@/types/userFeedback";


const REFRESH_URL = API_PROXY_PATHS.refresh();

export class UserFeedbackApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "UserFeedbackApiError";
    this.status = status;
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorParts(
  data: unknown,
  fallbackMessage: string,
): { message: string; code?: string } {
  if (!isRecord(data)) {
    return { message: fallbackMessage };
  }

  const detail = data.detail;

  if (typeof detail === "string") {
    return { message: detail };
  }

  if (Array.isArray(detail)) {
    const first = detail[0];

    if (isRecord(first) && typeof first.msg === "string") {
      return { message: first.msg };
    }
  }

  if (isRecord(detail)) {
    return {
      message:
        typeof detail.message === "string"
          ? detail.message
          : fallbackMessage,
      code: typeof detail.code === "string" ? detail.code : undefined,
    };
  }

  return { message: fallbackMessage };
}

async function refreshSession(): Promise<boolean> {
  const response = await fetch(REFRESH_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  return response.ok;
}

async function feedbackFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  const requestInit: RequestInit = {
    ...init,
    credentials: "include",
    headers,
  };

  let response = await fetch(input, requestInit);

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshSession();

  if (!refreshed) {
    return response;
  }

  response = await fetch(input, requestInit);

  return response;
}

async function parseResponse<T>(
  response: Response,
  fallbackMessage = "Feedback request failed.",
): Promise<T> {
  const data = await readJson(response);

  if (!response.ok) {
    const { message, code } = getErrorParts(data, fallbackMessage);
    throw new UserFeedbackApiError(message, response.status, code);
  }

  return data as T;
}

function validateFeedbackId(feedbackId: number): void {
  if (!Number.isInteger(feedbackId) || feedbackId <= 0) {
    throw new UserFeedbackApiError(
      "Please provide a valid feedback ID.",
      400,
      "INVALID_FEEDBACK_ID",
    );
  }
}

function jsonHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}

export async function submitUserFeedback(
  payload: SubmitFeedbackPayload,
): Promise<UserFeedbackOut> {
  const response = await feedbackFetch(API_PROXY_PATHS.feedback(), {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse<UserFeedbackOut>(
    response,
    "Unable to submit feedback.",
  );
}

export async function listMyFeedback(): Promise<UserFeedbackOut[]> {
  const response = await feedbackFetch(API_PROXY_PATHS.myFeedback(), {
    method: "GET",
  });

  return parseResponse<UserFeedbackOut[]>(
    response,
    "Unable to load your feedback.",
  );
}

export async function updateUserFeedback({
  feedbackId,
  ...payload
}: UpdateFeedbackPayload): Promise<UserFeedbackOut> {
  validateFeedbackId(feedbackId);

  const response = await feedbackFetch(
    API_PROXY_PATHS.feedbackItem(feedbackId),
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    },
  );

  return parseResponse<UserFeedbackOut>(
    response,
    "Unable to update feedback.",
  );
}

export async function deleteUserFeedback(feedbackId: number): Promise<void> {
  validateFeedbackId(feedbackId);

  const response = await feedbackFetch(
    API_PROXY_PATHS.feedbackItem(feedbackId),
    {
      method: "DELETE",
    },
  );

  if (response.status === 204) {
    return;
  }

  await parseResponse<unknown>(response, "Unable to delete feedback.");
}

export async function listAdminFeedback(
  params: AdminFeedbackListParams = {},
): Promise<AdminFeedbackListOut> {
  const response = await feedbackFetch(
    API_PROXY_PATHS.adminFeedback(params),
    {
      method: "GET",
    },
  );

  return parseResponse<AdminFeedbackListOut>(
    response,
    "Unable to load feedback submissions.",
  );
}

export async function updateAdminFeedbackStatus({
  feedbackId,
  status,
}: AdminFeedbackStatusUpdatePayload): Promise<AdminFeedbackOut> {
  validateFeedbackId(feedbackId);

  const response = await feedbackFetch(
    API_PROXY_PATHS.adminFeedbackStatus(feedbackId),
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ status }),
    },
  );

  return parseResponse<AdminFeedbackOut>(
    response,
    "Unable to update feedback status.",
  );
}

export async function deleteAdminFeedback(feedbackId: number): Promise<void> {
  validateFeedbackId(feedbackId);

  const response = await feedbackFetch(
    API_PROXY_PATHS.adminFeedbackItem(feedbackId),
    {
      method: "DELETE",
    },
  );

  if (response.status === 204) {
    return;
  }

  await parseResponse<unknown>(response, "Unable to delete feedback.");
}