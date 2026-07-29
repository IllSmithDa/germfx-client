/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { addUserMedication } from "@/app/actions/userMedicationActions";
import { CLIENT_PATHS } from "@/config/paths";
import { formatDrugName } from "@/lib/helpers/format_text";
import { UserMedicationPayload } from "@/types/userMedication";

import UserMedicationForm, {
  MedicationFormValues,
} from "../UserMedicationForm/UserMedicationForm";
import { UsageLimitStatus } from "../UsageLimitNotice/UsageLimitNotice";

type Props = {
  drug_detail_id: string | number;
  drug_index_id: string | number;
  user_id?: string | number | null;
  name: string;
  initialAdded: boolean;
  buttonLabel?: string;
  userMedicationUsageStatus: UsageLimitStatus | null;
};

function getValidUserId(userId?: string | number | null) {
  if (userId === null || userId === undefined) {
    return null;
  }

  const value = String(userId).trim();

  if (!value) {
    return null;
  }

  return userId;
}

export default function UserMedicationControls({
  drug_detail_id,
  drug_index_id,
  user_id,
  name,
  initialAdded,
  buttonLabel = "Add to my medications",
  userMedicationUsageStatus
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [shouldClose, setShouldClose] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const validUserId = getValidUserId(user_id);
  const isAuthenticated = validUserId !== null;
  const busy = isPending || isSaving;

  function redirectToLogin() {
    const queryString = searchParams.toString();
    const nextPath = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(
      `${CLIENT_PATHS.clientLoginPath()}?next=${encodeURIComponent(nextPath)}`,
    );
  }

  function handleOpenMedicationForm() {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    setOpen(true);
  }

  useEffect(() => {
    if (!open || busy) {
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy]);

  async function handleSubmit(payload: MedicationFormValues) {
    if (!validUserId) {
      redirectToLogin();
      return;
    }

    setError(null);
    setIsSaving(true);

    const data: UserMedicationPayload = {
      ...payload,
      user_id: validUserId,
      drug_index_id,
      drug_detail_id,
      name,
    };

    const result = await addUserMedication(data);

    if (!result.ok) {
      setError(result.error ?? "Failed to add medication.");
      setIsSaving(false);
      return;
    }

    setShouldClose(true);

    startTransition(() => {
      router.refresh();
    });
  }

  useEffect(() => {
    if (!shouldClose || isPending) {
      return;
    }

    setIsSaving(false);
    setShouldClose(false);
    setOpen(false);

    if (initialAdded) {
      router.push("/user-medications");
    }
  }, [shouldClose, isPending, router, initialAdded]);

  return (
    <>
      <div className="flex flex-col items-end gap-1.5">
        {initialAdded && isAuthenticated ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-400/40 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            Already in your list
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleOpenMedicationForm}
          title={
            isAuthenticated
              ? undefined
              : "Log in to add this medication to your list"
          }
          className={[
            "mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[hsl(var(--border))]",
            "bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium",
            "text-[hsl(var(--foreground))] shadow-sm transition-colors",
            "hover:opacity-90",
            "disabled:cursor-not-allowed disabled:opacity-60",
            initialAdded && isAuthenticated
              ? "border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
          ].join(" ")}
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="8" y1="3" x2="8" y2="13" strokeLinecap="round" />
            <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
          </svg>

          {initialAdded && isAuthenticated ? "Add again" : buttonLabel}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-med-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!busy) {
                setOpen(false);
              }
            }}
            aria-label="Close"
            tabIndex={-1}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl">
            <div className="h-0.5 w-full bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500 opacity-60" />

            <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/10">
                  <svg
                    className="h-4 w-4 text-sky-500"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M6 2h4v3l1.5 2H4.5L6 5V2z" />
                    <rect x="3" y="7" width="10" height="7" rx="1.5" />
                    <line
                      x1="8"
                      y1="9.5"
                      x2="8"
                      y2="12"
                      strokeLinecap="round"
                    />
                    <line
                      x1="6.5"
                      y1="10.75"
                      x2="9.5"
                      y2="10.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div>
                  <h3
                    id="add-med-modal-title"
                    className="text-sm font-semibold leading-tight text-[hsl(var(--foreground))]"
                  >
                    {initialAdded ? "Add again" : "Add medication"}
                  </h3>

                  <p className="max-w-[28ch] truncate text-xs text-[hsl(var(--muted-foreground))]">
                    {formatDrugName(name)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!busy) {
                    setOpen(false);
                  }
                }}
                className="shrink-0 rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                aria-label="Close"
                disabled={busy}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <line x1="3" y1="3" x2="13" y2="13" strokeLinecap="round" />
                  <line x1="13" y1="3" x2="3" y2="13" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {initialAdded && (
              <div className="mx-5 mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/40 bg-amber-500/8 px-3.5 py-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M8 2L1.5 13.5h13L8 2z" />
                  <line x1="8" y1="7" x2="8" y2="10" strokeLinecap="round" />
                  <circle
                    cx="8"
                    cy="12"
                    r="0.5"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>

                <div>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    This medication is already in your list
                  </p>

                  <p className="mt-0.5 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                    You can add it again for a new treatment period — for
                    example, if you stopped and restarted this medication.
                  </p>
                </div>
              </div>
            )}

            <div className="max-h-[calc(100svh-14rem)] overflow-y-auto px-5 py-5">
              <UserMedicationForm
                error={error ?? undefined}
                isSaving={isSaving}
                submitting={busy}
                submitLabel={
                  busy
                    ? "Saving…"
                    : initialAdded
                      ? "Add again"
                      : "Add medication"
                }
                onCancel={() => {
                  if (!busy) {
                    setOpen(false);
                  }
                }}
                onSubmitPayload={handleSubmit}
                description={
                  initialAdded
                    ? "Set the details for this new treatment period."
                    : "Capture a few details now — you can always edit later."
                }
                userMedicationUsageStatus={userMedicationUsageStatus}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}