import { CLIENT_PATHS } from "@/config/paths";

export type AdminUserStatusFilter = "all" | "active" | "suspended";

export type AdminUserOut = {
  id: number;
  username: string;
  role: string;
  is_active: boolean;
  account_status: string | null;
  suspended_at?: string | null;
  suspension_reason?: string | null;
  created_at?: string | null;
  can_suspend?: boolean;
  can_unsuspend?: boolean;
};

export type AdminUserListOut = {
  items: AdminUserOut[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
};

export type AdminStatusOut = {
  is_admin: boolean;
  role: string;
  user_id: number;
  username: string;
};

export type UserLookupPayload = {
  user_id?: number;
  username?: string;
  email?: string;
};

export type AssignUserRolePayload = UserLookupPayload & {
  role: "user" | "admin";
  reason?: string | null;
};

export type SuspendUserPayload = UserLookupPayload & {
  reason?: string | null;
};

export type UnsuspendUserPayload = UserLookupPayload & {
  reason?: string | null;
};

const REFRESH_URL = "/api/backend/auth/refresh";

export class AdminUsersApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "AdminUsersApiError";
    this.status = status;
    this.code = code;
  }
}

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") {
    return "Admin request failed.";
  }

  const detail = (data as { detail?: unknown }).detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (detail && typeof detail === "object") {
    const message = (detail as { message?: unknown }).message;

    if (typeof message === "string") {
      return message;
    }
  }

  return "Admin request failed.";
}

function getErrorCode(data: unknown) {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const detail = (data as { detail?: unknown }).detail;

  if (!detail || typeof detail !== "object") {
    return undefined;
  }

  const code = (detail as { code?: unknown }).code;

  return typeof code === "string" ? code : undefined;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await readJson(response);

  if (!response.ok) {
    throw new AdminUsersApiError(
      getErrorMessage(data),
      response.status,
      getErrorCode(data),
    );
  }

  return data as T;
}

async function refreshSession() {
  const response = await fetch(REFRESH_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  return response.ok;
}

async function adminUsersFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const requestInit: RequestInit = {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
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

export async function getAdminStatus(): Promise<AdminStatusOut> {
  const response = await adminUsersFetch(
    `${CLIENT_PATHS.adminUsersApiPath()}/me/admin-status`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return parseResponse<AdminStatusOut>(response);
}

export async function listAdminUsers({
  query,
  status = "all",
  page = 1,
  pageSize = 25,
}: {
  query?: string;
  status?: AdminUserStatusFilter;
  page?: number;
  pageSize?: number;
}): Promise<AdminUserListOut> {
  const params = new URLSearchParams();

  if (query?.trim()) {
    params.set("query", query.trim());
  }

  params.set("status", status);
  params.set("page", String(page));
  params.set("page_size", String(pageSize));

  const queryString = params.toString();
  const url = `${CLIENT_PATHS.adminUsersApiPath()}${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await adminUsersFetch(url, {
    method: "GET",
    cache: "no-store",
  });

  return parseResponse<AdminUserListOut>(response);
}

export async function suspendUser(
  payload: SuspendUserPayload,
): Promise<AdminUserOut> {
  const response = await adminUsersFetch(CLIENT_PATHS.adminSuspendUserApiPath(), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<AdminUserOut>(response);
}

export async function unsuspendUser(
  payload: UnsuspendUserPayload,
): Promise<AdminUserOut> {
  const response = await adminUsersFetch(
    CLIENT_PATHS.adminUnsuspendUserApiPath(),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return parseResponse<AdminUserOut>(response);
}

export async function assignUserRole(
  payload: AssignUserRolePayload,
): Promise<AdminUserOut> {
  const response = await adminUsersFetch(
    CLIENT_PATHS.adminAssignUserRoleApiPath(),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return parseResponse<AdminUserOut>(response);
}
