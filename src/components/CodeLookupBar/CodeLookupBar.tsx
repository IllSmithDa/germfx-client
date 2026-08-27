"use client";

import {
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";
import {
  Search,
} from "lucide-react";

import {
  CLIENT_PATHS,
} from "@/config/paths";

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

function normalizeDrugCode(
  input: string,
): string {
  return input
    .trim()
    .replace(/\s+/g, "");
}

export default function CodeLookupBar({
  title,
  description = "Enter a UPC or package NDC from the box or bottle.",
  placeholder = "e.g. 0070038610953 or 63941-519-15",
  buttonText = "Search",
  className = "w-full",
  inputId = "drug-code-search",
  descriptionMode = "visible",
}: Props) {
  const router = useRouter();

  const [
    code,
    setCode,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(null);

  function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    const normalized =
      normalizeDrugCode(code);

    if (!normalized) {
      return;
    }

    if (
      normalized.length >
      DRUG_CODE_MAX_LENGTH
    ) {
      setErrorMessage(
        `Drug code must be ${DRUG_CODE_MAX_LENGTH} characters or fewer.`,
      );
      return;
    }

    router.push(
      CLIENT_PATHS.drugCodeSearchPath(
        normalized,
      ),
    );
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    setErrorMessage(null);

    setCode(
      e.target.value.slice(
        0,
        DRUG_CODE_MAX_LENGTH,
      ),
    );
  }

  const showDescription =
    descriptionMode !== "hidden" &&
    Boolean(description);

  const descriptionClassName = [
    "mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:text-sm sm:leading-6",
    descriptionMode === "desktop"
      ? "hidden sm:block"
      : "",
  ].join(" ");

  return (
    <div className={className}>
      {(title ||
        showDescription) ? (
        <div className="mb-2 sm:mb-3">
          {title ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              {title}
            </p>
          ) : null}

          {showDescription ? (
            <p
              className={
                descriptionClassName
              }
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
      >
        <label
          htmlFor={inputId}
          className="sr-only"
        >
          Search by UPC or package NDC
        </label>

        <div className="relative sm:flex sm:items-center sm:gap-2">
          <input
            id={inputId}
            type="search"
            inputMode="text"
            value={code}
            onChange={handleChange}
            placeholder={placeholder}
            autoComplete="off"
            enterKeyHint="search"
            maxLength={
              DRUG_CODE_MAX_LENGTH
            }
            aria-invalid={
              errorMessage
                ? "true"
                : "false"
            }
            aria-describedby={
              errorMessage
                ? "drug-code-error"
                : undefined
            }
            className="min-h-10 w-full flex-1 rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 pr-11 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] sm:pr-3"
          />

          <button
            type="submit"
            aria-label="Search by code"
            className="absolute right-1 top-1/2 inline-grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] transition-[opacity,transform] duration-100 hover:opacity-90 active:scale-[0.94] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] motion-reduce:transform-none sm:static sm:inline-flex sm:size-auto sm:min-h-10 sm:translate-y-0 sm:items-center sm:justify-center sm:px-4 sm:py-2 sm:text-sm sm:font-semibold"
          >
            <Search
              size={16}
              className="sm:hidden"
              aria-hidden="true"
            />
            <span className="hidden sm:inline">
              {buttonText}
            </span>
          </button>
        </div>

        {errorMessage ? (
          <p
            id="drug-code-error"
            className="mt-2 text-xs text-[hsl(var(--destructive))]"
          >
            {errorMessage}
          </p>
        ) : null}
      </form>
    </div>
  );
}
