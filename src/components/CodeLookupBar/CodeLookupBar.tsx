"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CLIENT_PATHS } from "@/config/paths";

const DRUG_CODE_MAX_LENGTH = 25;

type Props = {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  className?: string;
  inputId?: string;
  descriptionMode?: "visible" | "desktop" | "hidden";
  mobileLayout?: "stacked" | "inline";
};

function normalizeDrugCode(input: string): string {
  return input.trim().replace(/\s+/g, "");
}

export default function CodeLookupBar({
  title,
  description = "Enter a UPC or package NDC from the box or bottle.",
  placeholder = "e.g. 0070038610953 or 63941-519-15",
  buttonText = "Search",
  className = "w-full",
  inputId = "drug-code-search",
  descriptionMode = "visible",
  mobileLayout = "stacked",
}: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalized = normalizeDrugCode(code);

    if (!normalized) {
      return;
    }

    if (normalized.length > DRUG_CODE_MAX_LENGTH) {
      setErrorMessage(
        `Drug code must be ${DRUG_CODE_MAX_LENGTH} characters or fewer.`,
      );
      return;
    }

    router.push(CLIENT_PATHS.drugCodeSearchPath(normalized));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setErrorMessage(null);
    setCode(e.target.value.slice(0, DRUG_CODE_MAX_LENGTH));
  }

  const showDescription = descriptionMode !== "hidden" && Boolean(description);
  const descriptionClassName = [
    "mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:text-sm sm:leading-6",
    descriptionMode === "desktop" ? "hidden sm:block" : "",
  ].join(" ");

  const controlLayoutClass =
    mobileLayout === "inline"
      ? "grid grid-cols-[minmax(0,1fr)_auto] items-stretch gap-2 sm:flex sm:flex-row sm:items-stretch"
      : "flex flex-col gap-2 sm:flex-row sm:items-stretch";

  const buttonClassName = [
    "h-10 shrink-0 cursor-pointer rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] sm:h-11 sm:px-5",
    mobileLayout === "inline" ? "min-w-[4.75rem]" : "w-full sm:w-auto",
  ].join(" ");

  return (
    <div className={className}>
      {(title || showDescription) && (
        <div className="mb-2 sm:mb-3">
          {title ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              {title}
            </p>
          ) : null}

          {showDescription ? <p className={descriptionClassName}>{description}</p> : null}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="sr-only">
          Search by UPC or package NDC
        </label>

        <div className={controlLayoutClass}>
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
              <svg
                className="h-4 w-4 text-[hsl(var(--muted-foreground))]"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect x="2.5" y="3" width="11" height="10" rx="1.5" />
                <path d="M5 5.5v5M7 5.5v5M10 5.5v5M11.5 5.5v5" />
              </svg>
            </span>

            <input
              id={inputId}
              type="text"
              value={code}
              onChange={handleChange}
              placeholder={placeholder}
              autoComplete="off"
              maxLength={DRUG_CODE_MAX_LENGTH}
              aria-invalid={errorMessage ? "true" : "false"}
              aria-describedby={errorMessage ? "drug-code-error" : undefined}
              className="h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] pl-10 pr-3 text-sm outline-none transition-shadow placeholder:text-[hsl(var(--muted-foreground)/0.6)] focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))/0.3)] sm:h-11 sm:pr-4"
            />

            {errorMessage ? (
              <p id="drug-code-error" className="mt-2 text-xs text-red-500">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <button type="submit" className={buttonClassName} aria-label="Search by code">
            {buttonText}
          </button>
        </div>
      </form>
    </div>
  );
}