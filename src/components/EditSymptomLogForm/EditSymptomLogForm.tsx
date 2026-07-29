/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {useEffect, useState, useRef} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useController } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import DateOnlyPicker from "@/components/DateOnlyPicker/DateOnlyPicker";
import { SymptomSuggest } from "@/components/Symptoms/SymptomSuggest";
import { CLIENT_PATHS } from "@/config/paths";
import type { MedOption } from "@/types";
import { formatDrugName } from "@/lib/helpers/format_text";
import RecentSymptomChips from "../RecentSymptomChips/RecentSymptomChips";
import SeverityPicker from "../SeverityPicker/SeveirtySelector";
import SortSelect from "@/components/SortSelector/SortSelect";

const EditSymptomLogSchema = z.object({
  dateISO: z
    .string()
    .min(1, "Pick a date")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date"),
  symptom_text: z.string().min(2, "Enter a symptom").max(100),
  details: z.string().max(500, "Max 500 characters").optional().or(z.literal("")),
  severity: z.number().int().min(1).max(10).nullable().optional(),
  user_medication_id: z.number().int().positive().nullable().optional(),
  possible_trigger: z.string().max(120, "Max 120 characters").optional().or(z.literal("")),
  management_strategy: z.string().optional().or(z.literal("")),
});

export type EditSymptomLogValues = z.infer<typeof EditSymptomLogSchema>;


function todayYYYYMMDD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function toNullableMedicationId(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function FieldLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="mb-1.5 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
      {children}
      {optional ? (
        <span className="normal-case font-normal opacity-60">(optional)</span>
      ) : null}
    </label>
  );
}
type EditSymptomLogFormProps = {
  userId: number;
  logId: number;
  initialValues: EditSymptomLogValues;
  recentSymptomNames?: string[];
  medOptions?: MedOption[];
  submitLabel?: string;
  busy?: boolean;
  description ?: string;
  error?: string | null;
  onCancel?: () => void;
  onSubmit: (values: EditSymptomLogValues) => Promise<void> | void;
};
export default function EditSymptomLogForm({
  busy,
  logId,
  initialValues,
  medOptions = [],
  recentSymptomNames = [],
  submitLabel = "Save changes",
  description = "",
  onCancel,
  onSubmit,
  error
}: EditSymptomLogFormProps) {
  const router = useRouter();
  const isModalMode = Boolean(onCancel);

  const {
    control,
    handleSubmit,
    formState,
    setValue,
    reset,
    watch,
  } = useForm<EditSymptomLogValues>({
    resolver: zodResolver(EditSymptomLogSchema),
    defaultValues: {
      dateISO: initialValues.dateISO ?? todayYYYYMMDD(),
      symptom_text: initialValues.symptom_text ?? "",
      details: initialValues.details ?? "",
      severity: initialValues.severity ?? null,
      user_medication_id: toNullableMedicationId(
        initialValues.user_medication_id
      ),
      possible_trigger: initialValues.possible_trigger ?? "",
      management_strategy: initialValues.management_strategy ?? "",
    },
  });

  const lastResetLogIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (lastResetLogIdRef.current === logId) return;

    reset({
      dateISO: initialValues.dateISO ?? todayYYYYMMDD(),
      symptom_text: initialValues.symptom_text ?? "",
      details: initialValues.details ?? "",
      severity: initialValues.severity ?? null,
      user_medication_id: toNullableMedicationId(
        initialValues.user_medication_id
      ),
      possible_trigger: initialValues.possible_trigger ?? "",
      management_strategy: initialValues.management_strategy ?? "",
    });

    lastResetLogIdRef.current = logId;
  }, [logId, initialValues, reset]);

  const { field: dateField } = useController({
    name: "dateISO",
    control,
  });

  const symptomVal = watch("symptom_text");
  const detailsVal = watch("details");
  const severityVal = watch("severity");
  const medVal = watch("user_medication_id");
  const possibleTriggerVal = watch("possible_trigger");
  const managementStrategyVal = watch("management_strategy");
  async function onSubmitForm(values: EditSymptomLogValues) {
    onSubmit(values);
  }

  const formBody = (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 sm:space-y-5">
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 sm:p-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Symptom Date
          </span>
        </div>
        <div className="space-y-3.5 sm:space-y-4">
          <DateOnlyPicker
            value={dateField.value}
            onChange={(v) => dateField.onChange(v)}
          />
          {formState.errors.dateISO?.message ? (
            <p className="mt-1 text-xs text-[hsl(var(--destructive))]">
              {formState.errors.dateISO.message}
            </p>
          ) : null}
        <div>
        <FieldLabel>
          Symptom name{" "}
          <span className="text-rose-400 normal-case font-normal">*</span>
        </FieldLabel>
        <SymptomSuggest
          disabled={busy}
          value={symptomVal}
          onChange={(v) =>
            setValue("symptom_text", v, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          onPick={(v) =>
            setValue("symptom_text", v, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <RecentSymptomChips
          disabled={busy}
          names={recentSymptomNames}
          currentValue={symptomVal}
          onSelect={(name) =>
            setValue("symptom_text", name, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      
      </div>

          {medOptions.length > 0 ? (
            <div>
              <FieldLabel optional>Related medication</FieldLabel>

              <SortSelect
                id="edit-symptom-related-medication"
                value={medVal == null ? "" : String(medVal)}
                options={[
                  { value: "", label: "None" },
                  ...medOptions.map((m) => ({
                    value: String(m.id),
                    label: formatDrugName(m.name),
                  })),
                ]}
                ariaLabel="Related medication"
                label="Related medication"
                variant="field"
                icon="none"
                disabled={busy}
                onValueChange={(raw) =>
                  setValue(
                    "user_medication_id",
                    raw === "" ? null : toNullableMedicationId(raw),
                    { shouldDirty: true, shouldValidate: true },
                  )
                }
              />
            </div>
          ) : null}

          <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-3 sm:p-4">
            <div className="mb-4">
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                Add context if this symptom may be related to a condition, trigger, or action plan.
              </p>
            </div>

            <div className="mb-4">
              <FieldLabel optional>Possible trigger / related to</FieldLabel>
              <input
                value={possibleTriggerVal ?? ""}
                onChange={(e) =>
                  setValue("possible_trigger", e.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                maxLength={120}
                disabled={busy}
                className="min-h-11 w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition-shadow placeholder:text-[hsl(var(--muted-foreground))]/70 disabled:cursor-not-allowed disabled:opacity-60 focus:ring-2 focus:ring-[hsl(var(--ring))] sm:min-h-0 sm:py-2"
                placeholder="IBS, cold, allergies, stress, food, poor sleep, unknown…"
              />
            </div>
              
            <div>
              <FieldLabel optional>How are you handling it?</FieldLabel>
              <input
                value={managementStrategyVal ?? ""}
                onChange={(e) =>
                  setValue("management_strategy", e.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                disabled={busy}
                className="min-h-11 w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition-shadow placeholder:text-[hsl(var(--muted-foreground))]/70 disabled:cursor-not-allowed disabled:opacity-60 focus:ring-2 focus:ring-[hsl(var(--ring))] sm:min-h-0 sm:py-2"
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
              disabled={busy}
              value={severityVal}
              onChange={(v) =>
                setValue("severity", v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </div>

          <div>
            <FieldLabel optional>Notes</FieldLabel>

            <textarea
              value={detailsVal ?? ""}
              onChange={(e) =>
                setValue("details", e.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              disabled={busy}
              rows={4}
              className={[
                "w-full rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))]",
                "px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-y transition-shadow sm:py-2",
                "placeholder:text-[hsl(var(--muted-foreground))/50]",
              ].join(" ")}
              placeholder="Triggers, time of day, context…"
            />

            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 sm:flex sm:items-center sm:justify-end">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (busy) return;
            if (onCancel) {
              onCancel();
              return;
            }

            router.back();
          }}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer sm:min-h-0"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={busy || !formState.isDirty}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] sm:min-h-0"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );

  if (isModalMode) return formBody;

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="mx-auto max-w-3xl px-3 py-6 pb-28 sm:px-4 sm:py-10 sm:pb-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Edit Symptom Log</h1>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {description}
            </p>
          </div>

          <Link
            href={CLIENT_PATHS.homePath()}
            className="inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          >
            Back
          </Link>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-4 shadow-sm sm:px-5 sm:py-5">
          {formBody}
        </div>
      </div>
    </div>
  );
}