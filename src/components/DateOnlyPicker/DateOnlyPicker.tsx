// components/DateOnlyPicker.tsx
"use client";

import {
  Button as RAButton,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Label,
  Popover,
} from "react-aria-components";
import {
  getLocalTimeZone,
  parseDate,
  fromDate,
  today as intlToday,
  DateValue,
} from "@internationalized/date";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

export type DateOnlyPickerProps = {
  label?: string;
  value: string | null;            // YYYY-MM-DD
  onChange: (iso: string) => void; // YYYY-MM-DD
  error?: string | null;
  /** Optional bounds; defaults: minValue = undefined, maxValue = today (no future dates) */
  minISO?: string | null;          // YYYY-MM-DD
  maxISO?: string | null;          // YYYY-MM-DD
  disabled?: boolean;
};

function toISO(v: DateValue | null): string {
  if (!v) return "";
  const d = v.toDate(getLocalTimeZone());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate() + 0).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function fromISO(s: string | null): DateValue | null {
  if (!s) return null;
  try {
    return parseDate(s); // expects YYYY-MM-DD
  } catch {
    return fromDate(new Date(), getLocalTimeZone());
  }
}

export default function DateOnlyPicker({
  label = "",
  value,
  onChange,
  error,
  minISO = null,
  maxISO = null,
  disabled
}: DateOnlyPickerProps) {
  const tz = getLocalTimeZone();
  const todayDV = intlToday(tz);                          // "today" in local tz
  const pickerValue = fromISO(value ?? null);
  const minValue = minISO ? fromISO(minISO) ?? undefined : undefined;
  const maxValue = (maxISO ? fromISO(maxISO) : todayDV) ?? todayDV; // default: no future


  return (
    <div>
      <Label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">
        {label}
      </Label>

      <DatePicker
        aria-label={label}
        value={pickerValue ?? undefined}
        onChange={(v) => onChange(toISO(v ?? null))}
        granularity="day"
        minValue={minValue}
        maxValue={maxValue}
        className="group inline-block"
        isDisabled={disabled}
      >
        <Group className="flex items-center gap-2">
          <DateInput
            className={[
              "flex rounded-xl border px-3 text-sm ",
              "bg-transparent outline-none",
              "border-[hsl(var(--input))]",
              "text-[hsl(var(--foreground))]",
              "focus-within:ring-2 focus-within:ring-[hsl(var(--ring))]",
              // Make native calendar popups readable in dark mode
              "[color-scheme:light] dark:[color-scheme:dark]",
              "hover:opacity-80",
            ].join(" ")}
          >
            {(segment) => (
              <DateSegment
                segment={segment}
                className="rounded px-0.5 tabular-nums outline-none focus:bg-[hsl(var(--muted))]"
              />
            )}
          </DateInput>

          <RAButton
            className={[
              "rounded-xl border p-1 cursor-pointer",
              "border-[hsl(var(--input))]",
              "bg-[hsl(var(--card))] text-[hsl(var(--foreground))]",
              "hover:opacity-80",
              "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
            ].join(" ")}
            aria-label="Open calendar"
            isDisabled={disabled}
          >
            <ChevronDown size={18} />
          </RAButton>
        </Group>

        <Popover
          className={[
            "mt-1 rounded-2xl border shadow-lg",
            "border-[hsl(var(--border))]",
            "bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))]",
          ].join(" ")}
          placement="bottom start"
        >
          <Dialog className="p-3">
            <Calendar>
              <header className="mb-2 flex items-center justify-between">
                <RAButton
                  slot="previous"
                  className="rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] p-1 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  aria-label="Previous month"
                  isDisabled={disabled}
                >
                  <ChevronLeft size={18} />
                </RAButton>

                <Heading className="text-sm font-medium text-[hsl(var(--foreground))]" />

                <RAButton
                  isDisabled={disabled}
                  slot="next"
                  className="rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] p-1 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  aria-label="Next month"
                >
                  <ChevronRight size={18} />
                </RAButton>
              </header>

              <CalendarGrid>
                {(date) => {
                  const isToday = date.compare(todayDV) === 0;
                  return (
                    <CalendarCell
                      date={date}
                      className={clsx(
                        "m-0.5 grid h-8 w-8 place-items-center rounded text-sm",
                        "cursor-pointer",
                        "hover:bg-[hsl(var(--muted))]",
                        "aria-selected:bg-[hsl(var(--primary))] aria-selected:text-[hsl(var(--primary-foreground))]",
                        "aria-disabled:opacity-40 aria-disabled:cursor-not-allowed",
                        isToday && "ring-2 ring-[hsl(var(--ring))]"
                      )}
                    />
                  );
                }}
              </CalendarGrid>
            </Calendar>
          </Dialog>
        </Popover>
      </DatePicker>

      {error && (
        <p className="mt-1 text-xs text-[hsl(var(--destructive))]">{error}</p>
      )}
    </div>
  );
}
