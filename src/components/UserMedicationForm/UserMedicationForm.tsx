"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FREQUENCY_PRESETS, ROUTE_PRESETS } from "./UserMedicationHelper";
import UsageLimitNotice, { UsageLimitStatus } from "../UsageLimitNotice/UsageLimitNotice";
import SortSelect from "@/components/SortSelector/SortSelect";

type FrequencyPreset = (typeof FREQUENCY_PRESETS)[number];
type RoutePreset = (typeof ROUTE_PRESETS)[number];

const TRACKING_PURPOSE_OPTIONS = [
  { value: "", label: "No purpose" },
  { value: "active_use", label: "Currently taking" },
  { value: "inactive_history", label: "Previously took" },
  { value: "education", label: "Research" },
  { value: "considering", label: "Considering" },
  { value: "other", label: "Other" },
] as const;

const FREQUENCY_OPTIONS = [
  { value: "", label: "Not specified" },
  ...FREQUENCY_PRESETS.map((option) => ({ value: option, label: option })),
];

const ROUTE_OPTIONS = [
  { value: "", label: "Not specified" },
  ...ROUTE_PRESETS.map((option) => ({ value: option, label: option })),
];

const medicationFormSchema = z.object({
  is_active: z.boolean(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  nickname: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  dosage: z.string().max(100).optional(),
  frequency_preset: z
    .enum(FREQUENCY_PRESETS)
    .nullable(),
  frequency_other: z.string().optional(),
  route_preset: z
    .enum(ROUTE_PRESETS)
    .nullable(),
  route_other: z.string().optional(),
  tracking_purpose: z.string().optional()
});

export type MedicationFormValues = z.infer<typeof medicationFormSchema>;

function toNullIfBlank(s?: string | null): string | null {
  const t = (s ?? "").trim();
  return t ? t : null;
}

function todayYYYYMMDD() {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${mm}-${dd}`;
}

function isPastDateYYYYMMDD(d: string): boolean {
  return d < todayYYYYMMDD();
}

// ---- Shared sub-components ----
function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))] sm:mb-1.5 sm:text-xs"
    >
      {children}
      {optional && <span className="normal-case font-normal opacity-60">(optional)</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs leading-5 text-[hsl(var(--destructive))]">{message}</p>;
}

const inputClass =
  "block min-h-11 w-full min-w-0 max-w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none transition-shadow placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:ring-2 focus:ring-[hsl(var(--ring))]";

const fieldClass = "min-w-0 max-w-full";

// ---- Props ----
type Props = {
  onSubmitPayload?: (payload: MedicationFormValues) => void | Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  submitLabel?: string;
  title?: string;
  description?: string;
  initialValues?: Partial<MedicationFormValues>;
  error?: string;
  isSaving?: boolean;
  userMedicationUsageStatus?: UsageLimitStatus | null;
};

export default function UserMedicationForm({
  onSubmitPayload = async () => {},
  onCancel,
  submitting = false,
  submitLabel = "Save changes",
  description = "Update your details — changes apply immediately.",
  initialValues,
  error,
  userMedicationUsageStatus
}: Props) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      is_active: true,
      start_date: null,
      end_date: null,
      nickname: "",
      notes: "",
      dosage: "",
      frequency_preset: null,
      frequency_other: "",
      route_preset: null,
      route_other: "",
      tracking_purpose: "",
      ...initialValues,
    },
  });

  const frequencyPreset = form.watch("frequency_preset");
  const routePreset = form.watch("route_preset");
  const isActive = form.watch("is_active");
  const endDate = form.watch("end_date");

  const hasAdvancedInitial =
    Boolean((initialValues?.dosage ?? "").trim()) ||
    Boolean(initialValues?.frequency_preset) ||
    Boolean((initialValues?.frequency_other ?? "").trim()) ||
    Boolean(initialValues?.route_preset) ||
    Boolean((initialValues?.route_other ?? "").trim());

  useEffect(() => {
    if (hasAdvancedInitial) setShowAdvanced(true);
  }, [hasAdvancedInitial]);

  useEffect(() => {
    if (frequencyPreset !== "Other") form.setValue("frequency_other", "", { shouldDirty: false });
  }, [frequencyPreset, form]);

  useEffect(() => {
    if (routePreset !== "Other") form.setValue("route_other", "", { shouldDirty: false });
  }, [routePreset, form]);

  useEffect(() => {
    const end = toNullIfBlank(endDate);
    if (!end) return;
    if (isPastDateYYYYMMDD(end) && isActive) {
      form.setValue("is_active", false, { shouldValidate: true, shouldDirty: true });
    }
  }, [endDate, isActive, form]);

  useEffect(() => {
    if (!initialValues || submitting) return;
    form.reset(
      {
        is_active: true,
        start_date: null,
        end_date: null,
        nickname: "",
        notes: "",
        dosage: "",
        frequency_preset: null,
        frequency_other: "",
        route_preset: null,
        route_other: "",
        tracking_purpose: "",
        ...initialValues,
      },
      { keepDirty: false, keepTouched: false }
    );
  }, [initialValues, submitting, form]);

  async function handleValid(values: MedicationFormValues) {
    await onSubmitPayload(values);
  }

  return (
    <form onSubmit={form.handleSubmit(handleValid)} className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      <UsageLimitNotice
        featureKey="user_medications"
        status={userMedicationUsageStatus}
      />
      {/* Description */}
      {description && (
        <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:text-sm sm:leading-6">{description}</p>
      )}

      {/* Root error */}
      {form.formState.errors.root?.message && (
        <div className="rounded-xl border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] px-3 py-2.5 text-sm leading-5 text-[hsl(var(--destructive))] sm:px-4">
          {form.formState.errors.root.message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm leading-5 text-rose-600 dark:text-rose-400 sm:px-4">
          {error}
        </div>
      )}

      {/* ── Status toggle ── */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-3 sm:gap-4 sm:px-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-5">Currently taking</div>
          <div className="mt-0.5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            Toggle off if you&apos;ve stopped taking this.
          </div>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          disabled={submitting}
          onClick={() => form.setValue("is_active", !isActive, { shouldDirty: true })}
          className={[
            "relative h-7 w-12 shrink-0 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1 cursor-pointer",
            isActive
              ? "border-green-400/60 bg-green-500"
              : "border-[hsl(var(--border))] bg-[hsl(var(--muted))]",
          ].join(" ")}
          aria-pressed={isActive}
          aria-label="Toggle active status"
        >
          <span
            className={[
              "absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow transition-all duration-150",
              isActive ? "left-[calc(100%-1.375rem)]" : "left-0.5",
            ].join(" ")}
          />
        </button>
      </div>
      <div className={fieldClass}>
        <FieldLabel htmlFor="tracking_purpose" optional>
          Tracking purpose
        </FieldLabel>

        <SortSelect
          id="tracking_purpose"
          value={form.watch("tracking_purpose") ?? ""}
          options={TRACKING_PURPOSE_OPTIONS}
          ariaLabel="Tracking purpose"
          label="Tracking purpose"
          variant="field"
          icon="none"
          disabled={submitting}
          onValueChange={(value) =>
            form.setValue("tracking_purpose", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        
        <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          Separates active use from research, history, or medications you are considering.
        </p>
      </div>
      {/* ── Dates ── */}
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={fieldClass}>
          <FieldLabel htmlFor="start_date" optional>Start date</FieldLabel>
          <input
            id="start_date"
            type="date"
            value={form.watch("start_date") ?? ""}
            onChange={(e) =>
              form.setValue("start_date", e.target.value || null, { shouldDirty: true })
            }
            className={inputClass}
            disabled={submitting}
          />
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                form.setValue("start_date", todayYYYYMMDD(), { shouldDirty: true })
              }
              className="text-xs text-[hsl(var(--muted-foreground))] underline underline-offset-2 hover:text-[hsl(var(--foreground))] cursor-pointer focus:outline-none"
            >
              Started today
            </button>
            <FieldError message={form.formState.errors.start_date?.message} />
          </div>
        </div>

        <div className={fieldClass}>
          <FieldLabel htmlFor="end_date" optional>End date</FieldLabel>
          <input
            id="end_date"
            disabled={submitting}
            type="date"
            value={form.watch("end_date") ?? ""}
            onChange={(e) =>
              form.setValue("end_date", e.target.value || null, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className={inputClass}
          />
          <FieldError message={form.formState.errors.end_date?.message} />
        </div>
      </div>

      {/* ── Nickname + Notes ── */}
      <div className={fieldClass}>
        <FieldLabel htmlFor="nickname" optional>Nickname</FieldLabel>
        <input
          id="nickname"
          disabled={submitting}
          value={form.watch("nickname") ?? ""}
          onChange={(e) => form.setValue("nickname", e.target.value, { shouldDirty: true })}
          placeholder='"Morning pill"'
          className={inputClass}
        />
        <FieldError message={form.formState.errors.nickname?.message} />
      </div>
      <div className={fieldClass}>
        <FieldLabel htmlFor="notes" optional>
          Notes
        </FieldLabel>

        <textarea
          id="notes"
          disabled={submitting}
          rows={3} // 👈 controls height (4 ≈ ~2x input)
          value={form.watch("notes") ?? ""}
          onChange={(e) =>
            form.setValue("notes", e.target.value, { shouldDirty: true })
          }
          placeholder="Anything to remember"
          className={`${inputClass} min-h-[88px] resize-y sm:min-h-[100px]`}
        />

        <FieldError message={form.formState.errors.notes?.message} />
      </div>

      {/* ── Advanced details collapsible ── */}
      <div className="min-w-0 overflow-hidden rounded-xl border border-[hsl(var(--border))]">
        <button
          type="button"
          disabled={submitting}
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 px-3 py-3 text-sm font-medium transition-colors hover:bg-[hsl(var(--muted)/0.5)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[hsl(var(--ring))] sm:px-4"
        >
          <span className="flex min-w-0 items-center gap-2 text-[hsl(var(--foreground))]">
            <svg className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6" />
              <line x1="8" y1="5" x2="8" y2="8" strokeLinecap="round" />
              <circle cx="8" cy="10.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
            More details
            <span className="hidden text-xs font-normal text-[hsl(var(--muted-foreground))] sm:inline">
              dosage, frequency, route
            </span>
          </span>
          <svg
            className={[
              "w-4 h-4 text-[hsl(var(--muted-foreground))] transition-transform duration-150",
              showAdvanced ? "rotate-180" : "",
            ].join(" ")}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline points="4,6 8,10 12,6" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="min-w-0 space-y-3 overflow-hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4">
            {/* Dosage */}
            <div className={fieldClass}>
              <FieldLabel htmlFor="dosage" optional>Dosage</FieldLabel>
              <input
                id="dosage"
                disabled={submitting}
                value={form.watch("dosage") ?? ""}
                onChange={(e) => form.setValue("dosage", e.target.value, { shouldDirty: true })}
                placeholder='"10 mg", "1 tablet", "2 sprays"'
                className={inputClass}
              />
              <FieldError message={form.formState.errors.dosage?.message} />
            </div>

            {/* Frequency */}
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <div className={fieldClass}>
                <FieldLabel htmlFor="frequency_preset" optional>Frequency</FieldLabel>
                <SortSelect
                  id="frequency_preset"
                  value={form.watch("frequency_preset") ?? ""}
                  options={FREQUENCY_OPTIONS}
                  ariaLabel="Frequency"
                  label="Frequency"
                  variant="field"
                  icon="none"
                  disabled={submitting}
                  onValueChange={(value) =>
                    form.setValue(
                      "frequency_preset",
                      value === "" ? null : (value as FrequencyPreset),
                      { shouldDirty: true, shouldValidate: true },
                    )
                  }
                />
              </div>

              {frequencyPreset === "Other" && (
                <div className={fieldClass}>
                  <FieldLabel htmlFor="frequency_other">Custom frequency</FieldLabel>
                  <input
                    id="frequency_other"
                    disabled={submitting}
                    value={form.watch("frequency_other") ?? ""}
                    onChange={(e) =>
                      form.setValue("frequency_other", e.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    placeholder='"Every 6 hours"'
                    className={inputClass}
                  />
                </div>
              )}
            </div>

            {/* Route */}
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <div className={fieldClass}>
                <FieldLabel htmlFor="route_preset" optional>Route</FieldLabel>
                <SortSelect
                  id="route_preset"
                  value={form.watch("route_preset") ?? ""}
                  options={ROUTE_OPTIONS}
                  ariaLabel="Route"
                  label="Route"
                  variant="field"
                  icon="none"
                  disabled={submitting}
                  onValueChange={(value) =>
                    form.setValue(
                      "route_preset",
                      value === "" ? null : (value as RoutePreset),
                      { shouldDirty: true, shouldValidate: true },
                    )
                  }
                />
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  How it&apos;s administered
                </p>
              </div>

              {routePreset === "Other" && (
                <div className={fieldClass}>
                  <FieldLabel htmlFor="route_other">Custom route</FieldLabel>
                  <input
                    id="route_other"
                    disabled={submitting}
                    value={form.watch("route_other") ?? ""}
                    onChange={(e) =>
                      form.setValue("route_other", e.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    placeholder='"Sublingual", "Rectal"'
                    className={inputClass}
                  />
                  <FieldError message={form.formState.errors.route_other?.message} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer actions ── */}
      <div
        className={[
          "grid gap-2 pt-1 sm:flex sm:items-center sm:justify-end",
          onCancel ? "grid-cols-2" : "grid-cols-1",
        ].join(" ")}
      >
        {onCancel && (
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="min-h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Saving…
            </>
          ) : submitLabel}
        </button>
      </div>
    </form>
  );
}