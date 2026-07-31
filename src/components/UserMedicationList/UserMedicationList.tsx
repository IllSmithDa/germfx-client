/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link";
import { CLIENT_PATHS } from "@/config/paths";

import { formatDrugName } from "@/lib/helpers/format_text";
import EditMedicationModal from "../EditMedicationModal/EditMedicationModal";
import DeleteUserMedicationModal from "../DeleteUserMedicationModal/DeleteUserMedicationModal";
import { UserMedication } from "@/types/userMedication";
import getTrackingPurposeLabel from "./LabelHelper";

type Props = {
  medications: UserMedication[];
};

const FREQUENCY_PRESETS = [
  "Once daily",
  "Twice daily",
  "Every 8 hours",
  "As needed",
  "Other",
] as const;

const ROUTE_PRESETS = [
  "Oral",
  "Topical",
  "Injection",
  "Inhalation",
  "Nasal",
  "Eye drops",
  "Other",
] as const;

function mapToPresetOrOther<const T extends readonly string[]>(
  value: string | null | undefined,
  presets: T,
): { preset: T[number] | null; other: string } {
  const v = (value ?? "").trim();
  if (!v) return { preset: null, other: "" };
  if ((presets as readonly string[]).includes(v)) {
    return { preset: v as T[number], other: "" };
  }
  if ((presets as readonly string[]).includes("Other")) {
    return { preset: "Other" as T[number], other: v };
  }
  return { preset: null, other: v };
}

function safeFormatDate(date?: string | null) {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function clampText(s?: string | null, max = 140) {
  const t = (s ?? "").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "…";
}

function NotesBlock({ notes }: { notes: string }) {
  const trimmed = notes.trim();
  if (!trimmed) return null;

  const preview = clampText(trimmed, 160);
  const needsExpand = preview !== trimmed;

  return (
    <div className="mt-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] px-2 sm:px-4 py-2 sm:py-3">
      <div className="mb-1 flex items-center gap-1.5">
        <svg
          className="h-3 w-3 text-[hsl(var(--muted-foreground))]"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <rect x="2" y="1" width="12" height="14" rx="1.5" />
          <line x1="5" y1="5" x2="11" y2="5" />
          <line x1="5" y1="8" x2="11" y2="8" />
          <line x1="5" y1="11" x2="8" y2="11" />
        </svg>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] sm:text-xs">
          Notes
        </span>
      </div>

      {needsExpand ? (
        <details className="group">
          <summary className="cursor-pointer select-none list-none text-xs leading-5 text-[hsl(var(--foreground)/0.85)] sm:text-sm sm:leading-6">
            {preview}{" "}
            <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] group-open:hidden sm:text-xs">
              Show more ↓
            </span>
            <span className="hidden text-[11px] font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] group-open:inline sm:text-xs">
              Show less ↑
            </span>
          </summary>
          <div className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-[hsl(var(--foreground)/0.85)] sm:text-sm sm:leading-6">
            {trimmed}
          </div>
        </details>
      ) : (
        <div className="whitespace-pre-wrap text-xs leading-5 text-[hsl(var(--foreground)/0.85)] sm:text-sm sm:leading-6">
          {trimmed}
        </div>
      )}
    </div>
  );
}

function MetaChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-md bg-[hsl(var(--muted)/0.6)] px-2 py-1 text-[11px] leading-none text-[hsl(var(--muted-foreground))] sm:text-xs">
      <span className="grid h-3 w-3 shrink-0 place-items-center">{icon}</span>
      <span className="truncate">{label}</span>
    </span>
  );
}

const DosageIcon = () => (
  <svg className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2h4v3l1.5 2H4.5L6 5V2z" />
    <rect x="3" y="7" width="10" height="7" rx="1.5" />
    <line x1="8" y1="9.5" x2="8" y2="12" />
    <line x1="6.5" y1="10.75" x2="9.5" y2="10.75" />
  </svg>
);

const RouteIcon = () => (
  <svg className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="5.5" />
    <path d="M5.5 8h5M8 5.5v5" />
  </svg>
);

const FrequencyIcon = () => (
  <svg className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="5.5" />
    <polyline points="8,4.5 8,8 10.5,10" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="12" height="11" rx="1.5" />
    <line x1="5" y1="1.5" x2="5" y2="4.5" />
    <line x1="11" y1="1.5" x2="11" y2="4.5" />
    <line x1="2" y1="7" x2="14" y2="7" />
  </svg>
);

export default function UserMedicationList({ medications }: Props) {
  if (!medications.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] px-4 py-10 text-center sm:py-14">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--muted))] sm:h-12 sm:w-12">
          <svg className="h-5 w-5 text-[hsl(var(--muted-foreground))] sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 3h6v5l2 3H7l2-3V3z" />
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <line x1="12" y1="14" x2="12" y2="18" />
            <line x1="10" y1="16" x2="14" y2="16" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">
          No medications yet
        </p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Add your first medication to start tracking
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {medications.map((m) => {
        const freq = mapToPresetOrOther(m.frequency, FREQUENCY_PRESETS);
        const route = mapToPresetOrOther(m.route, ROUTE_PRESETS);

        const displayName = formatDrugName(m.name);
        const nickname = (m.nickname ?? "").trim();
        const hasNickname = nickname.length > 0;

        const start = safeFormatDate(m.start_date ?? null);
        const end = safeFormatDate(m.end_date ?? null);

        let dateLine: string | null = null;
        if (start && end) dateLine = `${start} → ${end}`;
        else if (start && !end) dateLine = `Started ${start}`;
        else if (!start && end) dateLine = `Ended ${end}`;

        const notes = (m.notes ?? "").trim();
        const hasNotes = notes.length > 0;

        const metaItems: { icon: React.ReactNode; label: string }[] = [];
        if (m.dosage) metaItems.push({ icon: <DosageIcon />, label: m.dosage });
        if (m.route) metaItems.push({ icon: <RouteIcon />, label: m.route });
        if (m.frequency) metaItems.push({ icon: <FrequencyIcon />, label: m.frequency });
        if (dateLine) metaItems.push({ icon: <CalendarIcon />, label: dateLine });

        const trackingPurposeLabel = getTrackingPurposeLabel(m.tracking_purpose);

        return (
          <div
            key={m.id}
            className="relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl"
          >
            <div
              className={[
                "absolute inset-y-0 left-0 w-1 rounded-l-xl sm:rounded-l-2xl",
                m.is_active ? "bg-green-500" : "bg-[hsl(var(--border))]",
              ].join(" ")}
            />

            <div className="p-2 pl-4 sm:p-5 sm:pl-6">
              <div className="min-w-0">
                <div className="mb-2 flex max-w-full flex-wrap items-center gap-1.5 sm:mb-3 sm:gap-2">
                  <span
                    className={[
                      "inline-flex min-h-6 max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none sm:text-xs",
                      m.is_active
                        ? "border-green-400/50 bg-green-500/10 text-green-600 dark:text-green-400"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
                        m.is_active
                          ? "bg-green-500"
                          : "bg-[hsl(var(--muted-foreground)/0.5)]",
                      ].join(" ")}
                    />
                    {m.is_active ? "Active" : "Inactive"}
                  </span>

                  {trackingPurposeLabel ? (
                    <span className="inline-flex min-h-6 max-w-full min-w-0 items-center rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold leading-none text-sky-600 dark:text-sky-300 sm:text-xs">
                      <span className="truncate">{trackingPurposeLabel}</span>
                    </span>
                  ) : null}
                </div>

                <div className="min-w-0">
                  <Link
                    href={CLIENT_PATHS.drugInfoPath(
                      Number(m.drug_index_id ?? 0),
                      m.name,
                    )}
                    className="block max-w-full text-sm font-semibold leading-5 text-[hsl(var(--foreground))] underline-offset-2 hover:underline sm:text-base sm:leading-snug"
                    title={m.name}
                  >
                    <span className="line-clamp-2 break-words">{displayName}</span>
                  </Link>

                  {hasNickname ? (
                    <span className="mt-2 inline-flex max-w-full items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <span className="truncate">&quot;{nickname}&quot;</span>
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3">
                {metaItems.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {metaItems.map((item, i) => (
                      <MetaChip key={i} icon={item.icon} label={item.label} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic leading-5 text-[hsl(var(--muted-foreground)/0.7)]">
                    Add dosage, route &amp; frequency for better tracking
                  </p>
                )}
              </div>

              {hasNotes ? <NotesBlock notes={notes} /> : null}

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[hsl(var(--border))] pt-3 [&>button]:min-h-9 [&>button]:w-full [&>button]:justify-center [&>button]:px-3 sm:mt-4 sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:[&>button]:w-auto">
                <EditMedicationModal
                  user_medication_id={Number(m.id)}
                  name={displayName}
                  initialValues={{
                    is_active: m.is_active,
                    start_date: m.start_date ?? null,
                    end_date: m.end_date ?? null,
                    nickname: m.nickname ?? "",
                    notes: m.notes ?? "",
                    dosage: m.dosage ?? "",
                    frequency_preset: freq.preset,
                    frequency_other: freq.other,
                    route_preset: route.preset,
                    route_other: route.other,
                    tracking_purpose: m.tracking_purpose ?? "",
                  }}
                />

                <DeleteUserMedicationModal
                  drugDetailId={Number(m.drug_detail_id)}
                  medicationName={displayName}
                  userMedicationId={m.id}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}