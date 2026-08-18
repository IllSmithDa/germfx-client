"use client";

import { useEffect, useMemo, useState } from "react";
import {
  assignUserRole,
  getAdminStatus,
  listAdminUsers,
  suspendUser,
  unsuspendUser,
  type AdminUserOut,
  type AdminUserStatusFilter,
  type UserLookupPayload,
} from "@/lib/client/adminUserApi";

type LookupType = "user_id" | "username" | "email";

type FeedbackState = {
  ok: boolean;
  message: string;
} | null;

type ModalAction = "suspend" | "unsuspend" | "promote";

type PendingModal = {
  action: ModalAction;
  user: AdminUserOut;
} | null;

const pageSize = 25;

function buildLookupPayload(
  lookupType: LookupType,
  value: string,
): UserLookupPayload {
  const trimmed = value.trim();

  if (lookupType === "user_id") {
    const parsedId = Number(trimmed);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      throw new Error("User ID must be a positive whole number.");
    }

    return {
      user_id: parsedId,
    };
  }

  if (lookupType === "username") {
    if (!trimmed) {
      throw new Error("Username is required.");
    }

    return {
      username: trimmed,
    };
  }

  if (!trimmed) {
    throw new Error("Email is required.");
  }

  return {
    email: trimmed,
  };
}

function isUserSuspended(user: AdminUserOut) {
  return user.account_status === "suspended" || !user.is_active;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function Feedback({ state }: { state: FeedbackState }) {
  if (!state) {
    return null;
  }

  return (
    <div
      className={[
        "rounded-xl border px-3.5 py-3 text-sm",
        state.ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-[hsl(var(--destructive))]/40 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
      ].join(" ")}
    >
      {state.message}
    </div>
  );
}

function StatusBadge({ user }: { user: AdminUserOut }) {
  const suspended = isUserSuspended(user);

  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        suspended
          ? "bg-red-500/10 text-red-600 dark:text-red-400"
          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      ].join(" ")}
    >
      {suspended ? "Suspended" : "Active"}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        role === "admin"
          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
          : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
      ].join(" ")}
    >
      {role}
    </span>
  );
}

function ConfirmActionModal({
  modal,
  pending,
  onClose,
  onConfirm,
}: {
  modal: PendingModal;
  pending: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    setReason("");
  }, [modal?.user.id, modal?.action]);

  if (!modal) {
    return null;
  }

  const { action, user } = modal;

  const title =
    action === "suspend"
      ? `Suspend ${user.username}?`
      : action === "unsuspend"
        ? `Restore ${user.username}?`
        : `Promote ${user.username} to admin?`;

  const description =
    action === "suspend"
      ? "This will lock the user out of their account and revoke existing sessions. Their data will not be deleted."
      : action === "unsuspend"
        ? "This will restore account access for this user."
        : "This will give the user admin access. Only promote users you fully trust.";

  const confirmLabel =
    action === "suspend"
      ? "Suspend User"
      : action === "unsuspend"
        ? "Restore User"
        : "Promote to Admin";

  const confirmClass =
    action === "suspend"
      ? "bg-red-600 text-white hover:bg-red-700"
      : action === "promote"
        ? "bg-purple-600 text-white hover:bg-purple-700"
        : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xl">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">{title}</h2>

          <p className="text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-[hsl(var(--muted))]/60 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">User #{user.id}</span>
            <span>{user.username}</span>
            <RoleBadge role={user.role} />
            <StatusBadge user={user} />
          </div>
        </div>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold">
            Reason {action === "suspend" ? "" : "(optional)"}
          </span>

          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            placeholder={
              action === "suspend"
                ? "Example: repeated abusive behavior, spam, policy violation"
                : "Optional admin note"
            }
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 sm:px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </label>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-xl border border-[hsl(var(--border))] px-2 sm:px-4 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            disabled={pending}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
              confirmClass,
            ].join(" ")}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPanel() {
  const [adminCheckPending, setAdminCheckPending] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AdminUserStatusFilter>("all");

  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUserOut[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const [lookupType, setLookupType] = useState<LookupType>("username");
  const [lookupValue, setLookupValue] = useState("");
  const [manualReason, setManualReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [manualPendingAction, setManualPendingAction] = useState<
    "suspend" | "unsuspend" | null
  >(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [modal, setModal] = useState<PendingModal>(null);
  const [resultUser, setResultUser] = useState<AdminUserOut | null>(null);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total]);

  const manualLookupPlaceholder = useMemo(() => {
    if (lookupType === "user_id") {
      return "Example: 12";
    }

    if (lookupType === "email") {
      return "user@example.com";
    }

    return "username";
  }, [lookupType]);

  useEffect(() => {
    let cancelled = false;

    async function checkAdminStatus() {
      try {
        await getAdminStatus();

        if (!cancelled) {
          setIsAdmin(true);
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) {
          setAdminCheckPending(false);
        }
      }
    }

    checkAdminStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadUsers(nextPage = page) {
    setLoading(true);

    try {
      const result = await listAdminUsers({
        query,
        status: statusFilter,
        page: nextPage,
        pageSize,
      });

      setUsers(result.items);
      setTotal(result.total);
      setHasNext(result.has_next);
      setPage(result.page);
    } catch (error) {
      setFeedback({
        ok: false,
        message:
          error instanceof Error ? error.message : "Unable to load users.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      loadUsers(1);
    }, 250);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, query, statusFilter]);

  async function handleModalConfirm(reason: string) {
    if (!modal) {
      return;
    }

    setActionPending(true);
    setFeedback(null);
    setResultUser(null);

    try {
      if (modal.action === "suspend") {
        await suspendUser({
          user_id: modal.user.id,
          reason: reason || null,
        });

        setFeedback({
          ok: true,
          message: `${modal.user.username} has been suspended.`,
        });
      }

      if (modal.action === "unsuspend") {
        await unsuspendUser({
          user_id: modal.user.id,
          reason: reason || null,
        });

        setFeedback({
          ok: true,
          message: `${modal.user.username} has been restored.`,
        });
      }

      if (modal.action === "promote") {
        await assignUserRole({
          user_id: modal.user.id,
          role: "admin",
          reason: reason || "Promoted from admin user management page.",
        });

        setFeedback({
          ok: true,
          message: `${modal.user.username} has been promoted to admin.`,
        });
      }

      setModal(null);
      await loadUsers(page);
    } catch (error) {
      setFeedback({
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to complete admin action.",
      });
    } finally {
      setActionPending(false);
    }
  }

  async function handleManualSuspend() {
    setFeedback(null);
    setResultUser(null);
    setManualPendingAction("suspend");

    try {
      const lookupPayload = buildLookupPayload(lookupType, lookupValue);

      const user = await suspendUser({
        ...lookupPayload,
        reason: manualReason.trim() || null,
      });

      setResultUser(user);
      setFeedback({
        ok: true,
        message: "User has been suspended and existing sessions were revoked.",
      });

      await loadUsers(page);
    } catch (error) {
      setFeedback({
        ok: false,
        message:
          error instanceof Error ? error.message : "Unable to suspend user.",
      });
    } finally {
      setManualPendingAction(null);
    }
  }

  async function handleManualUnsuspend() {
    setFeedback(null);
    setResultUser(null);
    setManualPendingAction("unsuspend");

    try {
      const lookupPayload = buildLookupPayload(lookupType, lookupValue);

      const user = await unsuspendUser({
        ...lookupPayload,
        reason: manualReason.trim() || null,
      });

      setResultUser(user);
      setFeedback({
        ok: true,
        message: "User has been restored.",
      });

      await loadUsers(page);
    } catch (error) {
      setFeedback({
        ok: false,
        message:
          error instanceof Error ? error.message : "Unable to restore user.",
      });
    } finally {
      setManualPendingAction(null);
    }
  }

  function canSuspend(user: AdminUserOut) {
    if (typeof user.can_suspend === "boolean") {
      return user.can_suspend;
    }

    return user.role !== "admin" && !isUserSuspended(user);
  }

  function canUnsuspend(user: AdminUserOut) {
    if (typeof user.can_unsuspend === "boolean") {
      return user.can_unsuspend;
    }

    return user.role !== "admin" && isUserSuspended(user);
  }

  function canPromote(user: AdminUserOut) {
    return user.role !== "admin" && !isUserSuspended(user);
  }

  if (adminCheckPending) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-sm text-[hsl(var(--muted-foreground))] shadow-sm">
        Checking admin access…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--destructive))]/40 bg-[hsl(var(--destructive))]/10 p-5 text-sm text-[hsl(var(--destructive))] shadow-sm">
        Admin access is required to manage users.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Feedback state={feedback} />

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-2">
            <label htmlFor="admin-user-search" className="text-sm font-semibold">
              Search users
            </label>

            <input
              id="admin-user-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by username, exact email, or user ID"
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 sm:px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="admin-user-status" className="text-sm font-semibold">
              Status
            </label>

            <select
              id="admin-user-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as AdminUserStatusFilter)
              }
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 sm:px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              <option value="all">All non-admin users</option>
              <option value="active">Active users</option>
              <option value="suspended">Suspended users</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => loadUsers(page)}
            disabled={loading}
            className="rounded-xl border border-[hsl(var(--border))] px-2 sm:px-4 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <div className="border-b border-[hsl(var(--border))] px-2 sm:px-5 py-4">
          <h2 className="text-md lg:text-lg font-bold">Users</h2>

          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Showing {users.length} of {total} matching users.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[hsl(var(--border))] text-sm">
            <thead className="bg-[hsl(var(--muted))]/60">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">User</th>
                <th className="px-5 py-3 text-left font-semibold">Role</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-left font-semibold">Created</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[hsl(var(--border))]">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-2 sm:px-5 py-4">
                      <div className="font-semibold">{user.username}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        User #{user.id}
                      </div>
                      {user.suspension_reason ? (
                        <div className="mt-1 max-w-xs text-xs text-[hsl(var(--muted-foreground))]">
                          Reason: {user.suspension_reason}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-2 sm:px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="px-2 sm:px-5 py-4">
                      <StatusBadge user={user} />
                    </td>

                    <td className="px-2 sm:px-5 py-4 text-[hsl(var(--muted-foreground))]">
                      {formatDate(user.created_at)}
                    </td>

                    <td className="px-2 sm:px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        {canPromote(user) ? (
                          <button
                            type="button"
                            onClick={() => setModal({ action: "promote", user })}
                            className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-700"
                          >
                            Promote
                          </button>
                        ) : null}

                        {canSuspend(user) ? (
                          <button
                            type="button"
                            onClick={() => setModal({ action: "suspend", user })}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                          >
                            Suspend
                          </button>
                        ) : null}

                        {canUnsuspend(user) ? (
                          <button
                            type="button"
                            onClick={() => setModal({ action: "unsuspend", user })}
                            className="rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold transition hover:bg-[hsl(var(--muted))]"
                          >
                            Restore
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] px-2 sm:px-5 py-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadUsers(page - 1)}
              disabled={loading || page <= 1}
              className="rounded-xl border border-[hsl(var(--border))] px-2 sm:px-4 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => loadUsers(page + 1)}
              disabled={loading || !hasNext}
              className="rounded-xl border border-[hsl(var(--border))] px-2 sm:px-4 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 sm:p-5 shadow-sm">
        <h2 className="text-md lg:text-lg font-bold">Manual lookup</h2>

        <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
          Use this when you know the exact user ID, username, or email. This is
          useful for exact email lookups because encrypted emails cannot be
          partially searched.
        </p>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Lookup by</span>

            <select
              value={lookupType}
              onChange={(event) => setLookupType(event.target.value as LookupType)}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 sm:px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="user_id">User ID</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold">User lookup value</span>

            <input
              value={lookupValue}
              onChange={(event) => setLookupValue(event.target.value)}
              placeholder={manualLookupPlaceholder}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 sm:px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-md lg:text-lg font-semibold">Suspension reason</span>

            <textarea
              value={manualReason}
              onChange={(event) => setManualReason(event.target.value)}
              placeholder="Example: abusive behavior, spam, policy violation"
              rows={4}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 sm:px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </label>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleManualUnsuspend}
              disabled={manualPendingAction !== null || actionPending}
              className="rounded-xl border border-[hsl(var(--border))] px-2 sm:px-4 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {manualPendingAction === "unsuspend" ? "Restoring…" : "Restore User"}
            </button>

            <button
              type="button"
              onClick={handleManualSuspend}
              disabled={manualPendingAction !== null || actionPending}
              className="rounded-xl bg-red-600 px-2 sm:px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {manualPendingAction === "suspend" ? "Suspending…" : "Suspend User"}
            </button>
          </div>
        </div>
      </div>

      {resultUser ? (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Last manual result · User #{resultUser.id}
              </p>
              <h2 className="mt-1 text-xl font-bold">{resultUser.username}</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <RoleBadge role={resultUser.role} />
              <StatusBadge user={resultUser} />
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmActionModal
        modal={modal}
        pending={actionPending}
        onClose={() => {
          if (!actionPending) {
            setModal(null);
          }
        }}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}
