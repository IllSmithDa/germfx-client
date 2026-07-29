"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import DateOnlyPicker from "@/components/DateOnlyPicker/DateOnlyPicker";
import RecentSymptomChips from "@/components/RecentSymptomChips/RecentSymptomChips";
import SeverityPicker from "@/components/SeverityPicker/SeveirtySelector";
import { SymptomSuggest } from "@/components/Symptoms/SymptomSuggest";

import { createUserSymptomLogs } from "@/app/actions/symptomLogActions";
import { CLIENT_PATHS } from "@/config/paths";
import { MedOption } from "@/types";
import SortSelect from "@/components/SortSelector/SortSelect";
import UsageLimitNotice, { UsageLimitStatus } from "@/components/UsageLimitNotice/UsageLimitNotice";

const SingleSymptomSchema = z.object({
  dateISO: z
    .string()
    .min(1, "Pick a date")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date"),
  symptom_text: z.string().min(2, "Enter a symptom").max(100),
  details: z
    .string()
    .max(500, "Max 500 characters")
    .optional()
    .or(z.literal("")),
  severity: z.number().int().min(1).max(10).nullable().optional(),
  user_medication_id: z.number().int().positive().nullable().optional(),
  possible_trigger: z.string().max(120).optional().nullable(),
  management_strategy: z.string().max(1000).optional().nullable(),
});

type SingleSymptomValues = z.infer<typeof SingleSymptomSchema>;

type Props = {
  medOptions?: MedOption[];
  recentSymptomNames?: string[];
  initialMedicationId?: number | null;
  submitLabel?: string;
  title?: string;
  description?: string;
  cancelHref?: string;
  redirectHref?: string;
  symptomLogUsageStatus ?: UsageLimitStatus | null
};

function todayYYYYMMDD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${d.getFullYear()}-${mm}-${dd}`;
}

function FieldLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="mb-1.5 flex items-center gap-1 text-xs font-medium uppercase tracking-wide">
      {children}

      {optional ? (
        <span className="normal-case font-normal opacity-60">(optional)</span>
      ) : null}
    </label>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Failed to create symptom log.";
}

export default function SingleSymptomForm({
  medOptions,
  recentSymptomNames,
  initialMedicationId = null,
  submitLabel = "Save symptom",
  title = "Log Symptom",
  description = "Record one symptom with optional severity, medication, notes, trigger, and management details.",
  cancelHref = CLIENT_PATHS.homePath(),
  redirectHref = CLIENT_PATHS.symptomLogsPath(),
  symptomLogUsageStatus,
}: Props) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    handleSubmit,
    formState,
    setValue,
    reset,
    watch,
  } = useForm<SingleSymptomValues>({
    resolver: zodResolver(SingleSymptomSchema),
    defaultValues: {
      dateISO: todayYYYYMMDD(),
      symptom_text: "",
      details: "",
      severity: null,
      user_medication_id: initialMedicationId ?? null,
      possible_trigger: "",
      management_strategy: "",
    },
  });

  const dateVal = watch("dateISO");
  const symptomVal = watch("symptom_text");
  const detailsVal = watch("details");
  const severityVal = watch("severity");
  const medVal = watch("user_medication_id");
  const possibleTriggerVal = watch("possible_trigger");
  const managementStrategyVal = watch("management_strategy");

  async function onSubmitForm(values: SingleSymptomValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createUserSymptomLogs({
        entries: [
          {
            dateISO: values.dateISO,
            symptom_text: values.symptom_text,
            details: values.details?.trim() || null,
            severity: values.severity ?? null,
            user_medication_id: values.user_medication_id ?? null,
            possible_trigger: values.possible_trigger?.trim() || null,
            management_strategy: values.management_strategy?.trim() || null,
          },
        ],
      });

      reset({
        dateISO: todayYYYYMMDD(),
        symptom_text: "",
        details: "",
        severity: null,
        user_medication_id: initialMedicationId ?? null,
        possible_trigger: "",
        management_strategy: "",
      });

      router.push(redirectHref);
    } catch (error) {
      console.error("Failed to create symptom log:", error);
      setSubmitError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:py-10 sm:pb-10">
        <UsageLimitNotice
          featureKey="symptom_logs"
          status={symptomLogUsageStatus}
        />
        <div className="mb-6 mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>

            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {description}
            </p>
          </div>

          <Link
            href={cancelHref}
            className="inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] sm:self-auto"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polyline
                points="10,3 4,8 10,13"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </Link>
        </div>

        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm"
        >
          <div className="space-y-4 px-5 py-5">
            <div className="relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
              <div className="absolute inset-y-0 left-0 w-0.5 bg-violet-500/50" />

              <div className="space-y-4 py-4 pl-4 pr-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/15 text-[10px] font-bold text-violet-600 dark:text-violet-400">
                    1
                  </span>

                  <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Symptom entry
                  </span>
                </div>

                <div>
                  <FieldLabel>Date</FieldLabel>

                  <DateOnlyPicker
                    disabled={isSubmitting}
                    label=""
                    value={dateVal}
                    onChange={(v) =>
                      setValue("dateISO", v, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                  />

                  {formState.errors.dateISO?.message ? (
                    <p className="mt-1 text-xs text-[hsl(var(--destructive))]">
                      {formState.errors.dateISO.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <FieldLabel>
                    Symptom name{" "}
                    <span className="ml-0.5 normal-case font-normal text-rose-400">
                      *
                    </span>
                  </FieldLabel>

                  <SymptomSuggest
                    disabled={isSubmitting}
                    value={symptomVal}
                    onChange={(v) =>
                      setValue("symptom_text", v, {
                        shouldValidate: true,
                      })
                    }
                    onPick={(v) =>
                      setValue("symptom_text", v, {
                        shouldValidate: true,
                      })
                    }
                  />

                  <RecentSymptomChips
                    disabled={isSubmitting}
                    names={recentSymptomNames ?? []}
                    currentValue={symptomVal}
                    onSelect={(name) =>
                      setValue("symptom_text", name, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />

                  {formState.errors.symptom_text?.message ? (
                    <p className="mt-1.5 text-xs text-[hsl(var(--destructive))]">
                      {formState.errors.symptom_text.message}
                    </p>
                  ) : null}
                </div>

                {medOptions && medOptions.length > 0 ? (
                  <div>
                    <FieldLabel optional>Related medication</FieldLabel>

                    <SortSelect
                      id="new-symptom-related-medication"
                      value={medVal == null ? "" : String(medVal)}
                      options={[
                        { value: "", label: "None" },
                        ...medOptions.map((m) => ({
                          value: String(m.id),
                          label: m.name,
                        })),
                      ]}
                      ariaLabel="Related medication"
                      label="Related medication"
                      variant="field"
                      icon="none"
                      disabled={isSubmitting}
                      onValueChange={(value) =>
                        setValue(
                          "user_medication_id",
                          value ? Number(value) : null,
                          { shouldDirty: true },
                        )
                      }
                    />
                  </div>
                ) : null}

                <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-4">
                  <div className="mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Additional context optional
                    </span>

                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                      Add context if this symptom may be related to a condition,
                      trigger, or action plan.
                    </p>
                  </div>

                  <div className="mb-4">
                    <FieldLabel optional>Possible trigger / related to</FieldLabel>

                    <input
                      disabled={isSubmitting}
                      value={possibleTriggerVal ?? ""}
                      onChange={(e) =>
                        setValue("possible_trigger", e.target.value, {
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
                        setValue("management_strategy", e.target.value, {
                          shouldDirty: true,
                        })
                      }
                      maxLength={1000}
                      className="w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none transition-shadow placeholder:text-[hsl(var(--muted-foreground))]/70 focus:ring-2 focus:ring-[hsl(var(--ring))]"
                      placeholder="Resting, hydration, monitoring, doctor visit…"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <FieldLabel optional>Severity</FieldLabel>

                    {severityVal != null ? (
                      <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs font-semibold">
                        {severityVal} / 10
                      </span>
                    ) : null}
                  </div>

                  <SeverityPicker
                    disabled={isSubmitting}
                    value={severityVal}
                    onChange={(v) =>
                      setValue("severity", v, {
                        shouldDirty: true,
                      })
                    }
                  />
                </div>

                <div>
                  <FieldLabel optional>Notes</FieldLabel>

                  <textarea
                    disabled={isSubmitting}
                    value={detailsVal ?? ""}
                    onChange={(e) =>
                      setValue("details", e.target.value, {
                        shouldDirty: true,
                      })
                    }
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none transition-shadow placeholder:text-[hsl(var(--muted-foreground))]/70 focus:ring-2 focus:ring-[hsl(var(--ring))]"
                    placeholder="Triggers, time of day, context…"
                  />

                  {formState.errors.details?.message ? (
                    <p className="mt-1 text-xs text-[hsl(var(--destructive))]">
                      {formState.errors.details.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {submitError ? (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
                {submitError}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[hsl(var(--border))] px-5 py-4">
            <Link
              href={cancelHref}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeOpacity="0.3"
                    />
                    <path
                      d="M8 2a6 6 0 0 1 6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Saving…
                </>
              ) : (
                submitLabel
              )}
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