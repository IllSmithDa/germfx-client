"use client";

import { ArrowUpDown, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useId, type ChangeEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SortSelectOption<T extends string = string> = {
  readonly value: T;
  readonly label: string;
};

type ExtraParams = Record<string, string | number | boolean | null | undefined>;

type SelectIcon = "sort" | "filter" | "none";
type SelectVariant = "toolbar" | "field";

type SortSelectProps<T extends string = string> = {
  value: T;
  options: readonly SortSelectOption<T>[];
  ariaLabel: string;
  defaultValue?: T;
  basePath?: string;
  paramName?: string;
  resetPageParam?: string | false;
  extraParams?: ExtraParams;
  deleteParamOnDefault?: boolean;
  label?: string;
  id?: string;
  name?: string;
  icon?: SelectIcon;
  variant?: SelectVariant;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
  onValueChange?: (value: T) => void;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function SortSelect<T extends string = string>({
  value,
  options,
  ariaLabel,
  defaultValue,
  basePath,
  paramName = "sort",
  resetPageParam = "page",
  extraParams,
  deleteParamOnDefault = true,
  label = "Sort",
  id,
  name,
  icon = "sort",
  variant = "toolbar",
  disabled = false,
  className = "",
  selectClassName = "",
  onValueChange,
}: SortSelectProps<T>) {
  const generatedId = useId();
  const selectId = id ?? `sort-select-${generatedId}`;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const nextValue = e.target.value as T;

    if (onValueChange) {
      onValueChange(nextValue);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (
      defaultValue !== undefined &&
      nextValue === defaultValue &&
      deleteParamOnDefault
    ) {
      params.delete(paramName);
    } else {
      params.set(paramName, nextValue);
    }

    if (resetPageParam) {
      params.set(resetPageParam, "1");
    }

    Object.entries(extraParams ?? {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === false) {
        params.delete(key);
        return;
      }

      params.set(key, String(value));
    });

    const queryString = params.toString();
    const targetPath = basePath ?? pathname;

    router.push(queryString ? `${targetPath}?${queryString}` : targetPath);
  }

  const LeadingIcon = icon === "filter" ? SlidersHorizontal : ArrowUpDown;
  const hasLeadingIcon = icon !== "none";
  const isField = variant === "field";

  return (
    <div
      className={joinClasses(
        isField ? "w-full min-w-0" : "w-full sm:w-auto",
        className,
      )}
    >
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>

      <div
        className={joinClasses(
          "group relative flex w-full min-w-0 items-center overflow-hidden rounded-xl",
          "focus-within:ring-2 focus-within:ring-[hsl(var(--ring))]",
          disabled && "opacity-60",
          isField
            ? "min-h-11 border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] transition-shadow"
            : "min-h-11 border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-colors hover:bg-[hsl(var(--muted))] sm:min-h-9 sm:w-auto",
        )}
      >
        {hasLeadingIcon ? (
          <span className="pointer-events-none absolute left-3 flex items-center text-[hsl(var(--muted-foreground))] transition-colors group-hover:text-[hsl(var(--foreground))]">
            <LeadingIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        ) : null}

        <select
          id={selectId}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-label={ariaLabel}
          className={joinClasses(
            "w-full min-w-0 cursor-pointer appearance-none rounded-xl bg-transparent outline-none transition-colors",
            "disabled:cursor-not-allowed",
            isField
              ? "min-h-11 py-2.5 pr-9 text-sm text-[hsl(var(--foreground))]"
              : "min-h-11 py-2.5 pr-9 text-sm font-semibold text-[hsl(var(--foreground))] sm:min-h-9 sm:w-auto sm:py-1.5 sm:text-xs",
            hasLeadingIcon ? "pl-9" : "pl-3",
            "[&>option]:bg-[hsl(var(--card))] [&>option]:text-[hsl(var(--foreground))]",
            selectClassName,
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3 flex items-center text-[hsl(var(--muted-foreground))] transition-transform group-focus-within:rotate-180 group-hover:text-[hsl(var(--foreground))]">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}