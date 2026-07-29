"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DateOnlyPicker from "@/components/DateOnlyPicker/DateOnlyPicker";
import { SymptomSuggest } from "@/components/Symptoms/SymptomSuggest";
import { CLIENT_PATHS } from "@/config/paths";
import { createUserSymptomLogs } from "@/app/actions/symptomLogActions";
import { MedOption } from "@/types";
import RecentSymptomChips from "@/components/RecentSymptomChips/RecentSymptomChips";
import SeverityPicker from "@/components/SeverityPicker/SeveirtySelector";

// ── Schema ───────────────────────────────────────────────────────────────────

const EntrySchema = z.object({
  dateISO: z
    .string()
    .min(1, "Pick a date")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date"),
  symptom_text: z.string().min(2, "Enter a symptom").max(100),
  details: z.string().max(500, "Max 500 characters").optional().or(z.literal("")),
  severity: z.number().int().min(1).max(10).nullable().optional(),
  user_medication_id: z.number().int().positive().nullable().optional(),
  possible_trigger: z.string().max(120).optional().nullable(),
  management_strategy: z.string().max(1000).optional().nullable(),
});

const LogSchema = z.object({
  entries: z.array(EntrySchema).min(1, "Add at least one symptom").max(20),
});

type LogValues = z.infer<typeof LogSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayYYYYMMDD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const selectClass =
  "w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer transition-shadow ";

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="mb-1.5 flex items-center gap-1 text-xs font-medium uppercase tracking-wide">
      {children}
      {optional && <span className="normal-case font-normal opacity-60">(optional)</span>}
    </label>
  );
}

type Props = {
  medOptions?: MedOption[];
  recentSymptomNames?: string[];
  initialMedicationId?: number | null;
  submitLabel?: string;
  description?: string;
  possible_trigger?: string | null;
  management_strategy?: string | null;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function SymptomFormView({
  medOptions,
  recentSymptomNames,
  initialMedicationId = null,
  submitLabel = "Save symptoms",
  description = "Record one or more symptoms. Each entry can have its own date.",
}: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  

  const { control, handleSubmit, formState, setValue, reset, watch } = useForm<LogValues>({
    resolver: zodResolver(LogSchema),
    defaultValues: {
      entries: [{
        dateISO: todayYYYYMMDD(),
        symptom_text: "",
        details: "",
        severity: null,
        user_medication_id: initialMedicationId ?? null,
        possible_trigger: '',
        management_strategy: '',
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({ name: "entries", control });

  async function onSubmitForm(values: LogValues) {
    setIsSubmitting(true);
    try {
      await createUserSymptomLogs({
        entries: values.entries.map((e) => ({
          dateISO: e.dateISO,
          symptom_text: e.symptom_text,
          details: e.details?.trim() || null,
          severity: e.severity ?? null,
          user_medication_id: e.user_medication_id ?? null,
          possible_trigger: e.possible_trigger?.trim() || null,
          management_strategy: e.management_strategy?.trim() || null,
        })),
      });

      reset({
        entries: [{
          dateISO: todayYYYYMMDD(),
          symptom_text: "",
          details: "",
          severity: null,
          user_medication_id: initialMedicationId ?? null,
          possible_trigger: '',
          management_strategy: '',
        }],
      });

      router.push(CLIENT_PATHS.symptomLogsPath());
      // router.refresh();
    } catch(error) {
      console.error("failed to create symptom logs: ", error);
      setIsSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="mx-auto max-w-3xl px-4 py-6 pb-28 sm:py-10 sm:pb-10">

        {/* Page header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Log Symptoms</h1>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
          </div>
          <Link
            href={CLIENT_PATHS.homePath()}
            className="inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] sm:self-auto"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="10,3 4,8 10,13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm"
        >
          <div className="space-y-4 px-5 py-5">

            {/* Entries list header */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {fields.length} symptom{fields.length !== 1 ? "s" : ""} added
              </span>
              <button
                disabled={isSubmitting}
                type="button"
                onClick={() =>
                  append({
                    dateISO: todayYYYYMMDD(),
                    symptom_text: "",
                    details: "",
                    severity: null,
                    user_medication_id: initialMedicationId ?? null,
                    possible_trigger: '',
                    management_strategy: '',
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1 text-xs font-medium transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="3" x2="8" y2="13" strokeLinecap="round" />
                  <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
                </svg>
                Add symptom
              </button>
            </div>

            {/* Entries */}
            {fields.map((f, idx) => {
              const dateVal     = watch(`entries.${idx}.dateISO`);
              const symptomVal  = watch(`entries.${idx}.symptom_text`);
              const detailsVal  = watch(`entries.${idx}.details`);
              const severityVal = watch(`entries.${idx}.severity`);
              const medVal      = watch(`entries.${idx}.user_medication_id`);
              const possibleTriggerVal = watch(`entries.${idx}.possible_trigger`);
              const managementStrategyVal = watch(`entries.${idx}.management_strategy`);
              const dateErr     = formState.errors.entries?.[idx]?.dateISO?.message;
              const symErr      = formState.errors.entries?.[idx]?.symptom_text?.message;
              
              return (
                <div
                  key={f.id}
                  className="relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                >
                  {/* Left violet accent strip */}
                  <div className="absolute inset-y-0 left-0 w-0.5 bg-violet-500/50" />

                  <div className="space-y-4 py-4 pl-4 pr-4">

                    {/* Entry header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/15 text-[10px] font-bold text-violet-600 dark:text-violet-400">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                          Symptom {idx + 1}
                        </span>
                      </div>
                      {fields.length > 1 && (
                        <button
                          disabled={isSubmitting}
                          type="button"
                          onClick={() => remove(idx)}
                          aria-label={`Remove symptom ${idx + 1}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2 py-1 text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polyline points="2,4 14,4" strokeLinecap="round" />
                            <path d="M6 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4" />
                            <path d="M3.5 4l.8 9.5a1 1 0 0 0 1 .9h5.4a1 1 0 0 0 1-.9L12.5 4" />
                          </svg>
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Date */}
                    <div>
                      <FieldLabel>Date</FieldLabel>
                      <DateOnlyPicker
                        disabled={isSubmitting}
                        label=""
                        value={dateVal}
                        onChange={(v) =>
                          setValue(`entries.${idx}.dateISO`, v, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                      />
                      {dateErr && (
                        <p className="mt-1 text-xs text-[hsl(var(--destructive))]">{dateErr}</p>
                      )}
                    </div>

                    {/* Symptom name + recent chips */}
                    <div>
                      <FieldLabel>
                        Symptom name{" "}
                        <span className="ml-0.5 normal-case font-normal text-rose-400">*</span>
                      </FieldLabel>
                      <SymptomSuggest
                        disabled={isSubmitting}
                        value={symptomVal}
                        onChange={(v) =>
                          setValue(`entries.${idx}.symptom_text`, v, { shouldValidate: true })
                        }
                        onPick={(v) =>
                          setValue(`entries.${idx}.symptom_text`, v, { shouldValidate: true })
                        }
                      />
                      <RecentSymptomChips
                        disabled={isSubmitting}
                        names={recentSymptomNames ?? []}
                        currentValue={symptomVal}
                        onSelect={(name) =>
                          setValue(`entries.${idx}.symptom_text`, name, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      />
                      {symErr && (
                        <p className="mt-1.5 text-xs text-[hsl(var(--destructive))]">{symErr}</p>
                      )}
                    </div>

                    {/* Related medication */}
                    {medOptions && medOptions.length > 0 && (
                      <div>
                        <FieldLabel optional>Related medication</FieldLabel>
                        <select
                          disabled={isSubmitting}
                          value={medVal ?? ""}
                          onChange={(e) =>
                            setValue(
                              `entries.${idx}.user_medication_id`,
                              e.target.value ? Number(e.target.value) : null,
                              { shouldDirty: true }
                            )
                          }
                          className={selectClass}
                        >
                          <option value="">None</option>
                          {medOptions.map((m) => (
                            <option key={m.id} value={m.id} disabled={isSubmitting}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-4">
                      <div className="mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wide">
                          Additional context optional
                        </span>
                        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                          Add context if this symptom may be related to a condition, trigger, or action plan.
                        </p>
                      </div>
                                      
                      <div className="mb-4">
                        <FieldLabel optional>Possible trigger / related to</FieldLabel>
                        <input
                          disabled={isSubmitting}
                          value={possibleTriggerVal ?? ""}
                          onChange={(e) =>
                            setValue(`entries.${idx}.possible_trigger`, e.target.value, {
                              shouldDirty: true,
                            })
                          }
                          maxLength={120}
                          className="w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none transition-shadow placeholder:text-[hsl(var(--muted-foreground))]/70 focus:ring-2 focus:ring-[hsl(var(--ring))]"
                          placeholder="IBS, cold, allergies, stress, food, poor sleep, unknown…"
                        />
                      </div>
                      <div>
                        <FieldLabel optional>How are you handling it?</FieldLabel>
                        <input
                          disabled={isSubmitting}
                          value={managementStrategyVal ?? ""}
                          onChange={(e) =>
                            setValue(`entries.${idx}.management_strategy`, e.target.value, {
                              shouldDirty: true,
                            })
                          }
                          className="w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none transition-shadow placeholder:text-[hsl(var(--muted-foreground))]/70 focus:ring-2 focus:ring-[hsl(var(--ring))]"
                          placeholder="Resting, hydration, monitoring, doctor visit…"
                        />
                      </div>
                    </div>
                    {/* Severity */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <FieldLabel optional>Severity</FieldLabel>
                        {severityVal != null && (
                          <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs font-semibold">
                            {severityVal} / 10
                          </span>
                        )}
                      </div>
                      <SeverityPicker
                        disabled={isSubmitting}
                        value={severityVal}
                        onChange={(v) =>
                          setValue(`entries.${idx}.severity`, v, { shouldDirty: true })
                        }
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <FieldLabel optional>Notes</FieldLabel>
                      <textarea
                        disabled={isSubmitting}
                        value={detailsVal ?? ""}
                        onChange={(e) =>
                          setValue(`entries.${idx}.details`, e.target.value, { shouldDirty: true })
                        }
                        rows={3}
                        className="w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none transition-shadow placeholder:text-[hsl(var(--muted-foreground))]/70 focus:ring-2 focus:ring-[hsl(var(--ring))]"
                        placeholder="Triggers, time of day, context…"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 border-t border-[hsl(var(--border))] px-5 py-4">
            <Link
              href={CLIENT_PATHS.homePath()}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Saving…
                </>
              ) : submitLabel}
            </button>
          </div>
        </form>

        <p className="mt-3 flex items-start gap-1.5 px-1 text-xs text-[hsl(var(--muted-foreground))]">
          <svg
            className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="8" cy="8" r="6" />
            <line x1="8" y1="7" x2="8" y2="11" strokeLinecap="round" />
            <circle cx="8" cy="5.5" r="0.5" fill="currentColor" stroke="none" />
          </svg>
          For personal tracking only — not medical advice.
        </p>
      </div>
    </div>
  );
}
