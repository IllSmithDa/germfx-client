/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import EditSymptomLogForm, { EditSymptomLogValues } from "@/components/EditSymptomLogForm/EditSymptomLogForm";
import type { MedOption } from "@/types";
import type { SymptomLogListItem } from "@/types/symptomLogs";
import { useLockBodyScroll } from "@/app/hooks/useLockBodyScroll";
import { useEscapeToClose } from "@/app/hooks/useEscapeToClose";
import { updateUserSymptomLog } from "@/app/actions/symptomLogActions";

type Props = {
  userId: number;
  log: SymptomLogListItem;
  recentSymptomNames?: string[];
  medOptions?: MedOption[];
};

export default function EditSymptomLogModal({ userId, log, recentSymptomNames, medOptions }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [shouldClose, setShouldClose] = useState(false);
  const [error, setError] = useState<string | null>();

  const busy = isSaving || isPending;
  const router = useRouter();

  useLockBodyScroll(open);
  useEscapeToClose(open && !busy, () => setOpen(false));

  const symptomLabel =
    (log.symptom?.term?.trim()) ||
    (log.symptom_text?.trim()) ||
    "Symptom";


  async function handleSubmit(values: EditSymptomLogValues) {
    setError(null);
    setIsSaving(true);
    
    const result = await updateUserSymptomLog({
      user_id: userId,
      symptom_log_id: Number(log.id),
      date: values.dateISO,
      symptom_text: values.symptom_text,
      details: values.details?.trim() || null,
      severity: values.severity ?? null,
      user_medication_id: values.user_medication_id,
      possible_trigger: values.possible_trigger?.trim() || null,
      management_strategy: values.management_strategy?.trim() || null,
    });
    // console.log("result: ", result)
    if (!result.ok) {
      // console.log('reached')
      setError(result.error ?? "Failed to update symptom log.");
      setIsSaving(false);
      return;
    }
    // console.log("reached 2")
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
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-8 min-w-20 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
      >
        <svg
          className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinejoin="round" />
          <line x1="9.5" y1="4.5" x2="11.5" y2="6.5" />
        </svg>
        Edit
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-log-modal-title"
        >
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            disabled={busy}
            onClick={() => {
              if (!busy) setOpen(false);
            }}
            aria-label="Close"
            tabIndex={-1}
          />

          {/* Panel */}
          <div className="relative z-10 max-h-[calc(100svh-1rem)] w-full max-w-xl overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl">
            {/* Top accent strip */}
            <div className="h-0.5 w-full bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500 opacity-60" />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-3 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10">
                  <svg
                    className="w-4 h-4 text-violet-500"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinejoin="round" />
                    <line x1="9.5" y1="4.5" x2="11.5" y2="6.5" />
                  </svg>
                </div>
                <div>
                  <h3
                    id="edit-log-modal-title"
                    className="text-sm font-semibold leading-tight text-[hsl(var(--foreground))] sm:text-base"
                  >
                    Edit symptom log
                  </h3>
                  <p className="max-w-[20ch] truncate text-xs text-[hsl(var(--muted-foreground))] sm:max-w-[28ch] sm:text-sm">
                    {symptomLabel}
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (!busy) setOpen(false);
                }}
                className="shrink-0 rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="3" y1="3" x2="13" y2="13" strokeLinecap="round" />
                  <line x1="13" y1="3" x2="3" y2="13" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="max-h-[calc(100svh-8rem)] overflow-y-auto px-3 py-3 sm:max-h-[calc(100svh-12rem)] sm:px-5 sm:py-5">
              <EditSymptomLogForm
                userId={userId}
                logId={Number(log.id)}
                recentSymptomNames={recentSymptomNames}
                medOptions={medOptions}
                initialValues={{
                  dateISO: log.date ?? "",
                  symptom_text: log.symptom_text ?? log.symptom?.term ?? "",
                  details: log.details ?? "",
                  severity: log.severity ?? null,
                  user_medication_id: Number(log.user_medication_id) || null,
                  possible_trigger: log.possible_trigger ?? "",
                  management_strategy: log.management_strategy ?? "",
                }}
                busy={busy}
                error={error}
                onCancel={() => {
                  if (!busy) setOpen(false);
                }}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}