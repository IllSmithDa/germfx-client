"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateUserMedication } from "@/app/actions/userMedicationActions";
import UserMedicationForm, {
  MedicationFormValues,
} from "../UserMedicationForm/UserMedicationForm";

type Props = {
  recentSymptomNames?: string[];
  user_medication_id: number | string;
  name: string;
  initialValues: Partial<MedicationFormValues>;
  buttonLabel?: string;
};

export default function EditMedicationModal({
  user_medication_id,
  name,
  initialValues,
  buttonLabel = "Edit",
}: Props) {
  const [open, setOpen] = useState(false);
  const [shouldClose, setShouldClose] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const busy = isPending || isSaving;
  const router = useRouter();

  useEffect(() => {
    if (busy || !open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, open]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  async function handleSubmit(payload: MedicationFormValues) {
    setError(null);
    setIsSaving(true);

    const res = await updateUserMedication({ user_medication_id, ...payload });
    if (!res.ok) {
      setError(res.error ?? "Failed to update medication.");
      setIsSaving(false);
      return;
    }

    setShouldClose(true);

    startTransition(() => {
      router.refresh();
    });
  }

  useEffect(() => {
    if (!shouldClose || isPending) return;

    setIsSaving(false);
    setShouldClose(false);
    setOpen(false);
  }, [shouldClose, isPending]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1.5 text-xs font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
      >
        <svg
          className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinejoin="round" />
          <line x1="9.5" y1="4.5" x2="11.5" y2="6.5" />
        </svg>
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-x-hidden p-2 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!busy) setOpen(false);
            }}
            aria-label="Close"
            tabIndex={-1}
          />

          <div className="relative z-10 flex max-h-[calc(100svh-1rem)] w-full min-w-0 max-w-lg flex-col overflow-hidden rounded-t-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl sm:max-h-[calc(100svh-2rem)] sm:rounded-2xl">
            <div className="h-0.5 w-full shrink-0 bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500 opacity-60" />

            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-3 py-3 sm:px-5 sm:py-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/10">
                  <svg
                    className="h-4 w-4 text-sky-500"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinejoin="round" />
                    <line x1="9.5" y1="4.5" x2="11.5" y2="6.5" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <h3
                    id="edit-modal-title"
                    className="text-sm font-semibold leading-tight text-[hsl(var(--foreground))]"
                  >
                    Edit medication
                  </h3>
                  <p className="line-clamp-2 max-w-[min(70vw,24rem)] text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                    {name}
                  </p>
                </div>
              </div>

              <button
                disabled={busy}
                type="button"
                onClick={() => {
                  if (!busy) setOpen(false);
                }}
                className="shrink-0 cursor-pointer rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <line x1="3" y1="3" x2="13" y2="13" strokeLinecap="round" />
                  <line x1="13" y1="3" x2="3" y2="13" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3 sm:px-5 sm:py-5">
              <UserMedicationForm
                error={error ?? undefined}
                isSaving={isSaving}
                submitting={busy}
                submitLabel={busy ? "Saving…" : "Save changes"}
                onCancel={() => {
                  if (!busy) setOpen(false);
                }}
                onSubmitPayload={handleSubmit}
                initialValues={initialValues}
                description="Update your details — changes apply immediately."
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}