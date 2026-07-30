"use client";

import {
  ArrowUpDown,
  Check,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { useId } from "react";
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";
import type { Key } from "react-aria-components";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

export type SortSelectOption<T extends string = string> = {
  readonly value: T;
  readonly label: string;
};

type ExtraParams = Record<
  string,
  string | number | boolean | null | undefined
>;

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

function joinClasses(
  ...classes: Array<string | false | null | undefined>
) {
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

  function handleValueChange(nextValue: T) {
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

    Object.entries(extraParams ?? {}).forEach(([key, extraValue]) => {
      if (
        extraValue === null ||
        extraValue === undefined ||
        extraValue === "" ||
        extraValue === false
      ) {
        params.delete(key);
        return;
      }
      params.set(key, String(extraValue));
    });

    const queryString = params.toString();
    const targetPath = basePath ?? pathname;

    router.push(
      queryString ? `${targetPath}?${queryString}` : targetPath,
    );
  }

  const LeadingIcon =
    icon === "filter" ? SlidersHorizontal : ArrowUpDown;

  const hasLeadingIcon = icon !== "none";
  const isField = variant === "field";

  return (
    <Select
      id={selectId}
      name={name}
      // ✅ Replaces deprecated selectedKey + onSelectionChange
      selectedKey={value}
      onSelectionChange={(key: Key) => {
        if (key !== null) {
          handleValueChange(String(key) as T);
        }
      }}
      isDisabled={disabled}
      aria-label={ariaLabel}
      className={joinClasses(
        "group/select",
        isField ? "w-full min-w-0" : "w-full sm:w-auto",
        disabled && "opacity-60",
        className,
      )}
    >
      <Label className="sr-only">{label}</Label>

      <Button
        type="button"
        className={joinClasses(
          // ✅ Use flex + items-center so all children (icons + text) share one flex row
          "group/trigger relative flex w-full min-w-0 cursor-pointer items-center gap-0",
          "overflow-hidden rounded-xl outline-none",
          "focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
          "disabled:cursor-not-allowed",
          isField
            ? "min-h-11 border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] transition-shadow hover:bg-[hsl(var(--muted))]"
            : "min-h-11 border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-colors hover:bg-[hsl(var(--muted))] sm:min-h-9 sm:w-auto ",
          selectClassName,
        )}
      >
        {/* Leading icon — participates in the flex row, not absolute */}
        {hasLeadingIcon && (
          <span
            aria-hidden="true"
            className="flex shrink-0 items-center pl-3 pr-1.5 text-[hsl(var(--muted-foreground))] transition-colors group-hover/trigger:text-[hsl(var(--foreground))]"
          >
            <LeadingIcon className="h-3.5 w-3.5" />
          </span>
        )}

        {/* ✅ SelectValue: flex-1, items-center, no block/py padding — aligns with icons */}
        <SelectValue
          className={joinClasses(
            "flex min-w-0 flex-1 items-center truncate text-left text-[hsl(var(--foreground))]",
            isField
              ? "h-11 text-sm"
              : "h-11 text-sm font-semibold sm:h-9 sm:text-xs",
            // Left padding only when there is no leading icon
            !hasLeadingIcon ? "pl-3" : "pl-1",
            // Right padding to clear the trailing chevron
            "pr-9",
          )}
        />

        {/* Trailing chevron — absolute so it overlaps the pr-9 gap cleanly */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 flex items-center text-[hsl(var(--muted-foreground))] transition-transform duration-150 group-data-[open]/select:rotate-180 group-hover/trigger:text-[hsl(var(--foreground))]"
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </Button>

      <Popover
        offset={6}
        className={joinClasses(
          "z-50 w-[var(--trigger-width)] min-w-[12rem] overflow-hidden rounded-xl",
          "border border-[hsl(var(--border))] bg-[hsl(var(--popover,var(--card)))] shadow-lg",
        )}
      >
        <ListBox
          items={options}
          aria-label={ariaLabel}
          className="max-h-72 overflow-auto p-1 outline-none"
        >
          {(option) => (
            <ListBoxItem
              id={option.value}
              textValue={option.label}
              className={joinClasses(
                "group/item flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-colors",
                "text-[hsl(var(--foreground))]",
                "data-[hovered]:bg-[hsl(var(--muted))]",
                "data-[focused]:bg-[hsl(var(--muted))]",
                "data-[pressed]:bg-[hsl(var(--accent,var(--muted)))]",
                "data-[selected]:bg-[hsl(var(--muted))] data-[selected]:font-semibold",
              )}
            >
              {({ isSelected }) => (
                <>
                  <span className="min-w-0 flex-1 truncate">
                    {option.label}
                  </span>

                  <Check
                    className={joinClasses(
                      "h-4 w-4 shrink-0 text-[hsl(var(--primary))]",
                      !isSelected && "invisible",
                    )}
                    aria-hidden="true"
                  />
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </Select>
  );
}
