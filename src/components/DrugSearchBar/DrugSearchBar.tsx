// components/DrugSearchBar/DrugSearchBar.tsx

import { Search } from "lucide-react";

const DEFAULT_DRUG_SEARCH_MAX_LENGTH = 100;

type Props = {
  action: string | ((formData: FormData) => void | Promise<void>);
  className?: string;
  placeholder?: string;
  tipText?: string;
  inputName?: string;
  inputId?: string;
  buttonText?: string;
  maxLength?: number;
  mobileLayout?: "stacked" | "adaptive" | "inline";
};

export default function DrugSearchBar({
  action,
  className,
  placeholder = "Search by brand name or generic (e.g. Tylenol, acetaminophen)",
  tipText = "",
  inputName = "q",
  inputId = "drug-search",
  buttonText = "Search",
  maxLength = DEFAULT_DRUG_SEARCH_MAX_LENGTH,
}: Props) {
  return (
    <section className={className}>
      <form action={action}>
        <label
          htmlFor={inputId}
          className="sr-only"
        >
          Search for a drug
        </label>

        <div className="relative sm:flex sm:items-center sm:gap-2">
          <input
            id={inputId}
            name={inputName}
            type="search"
            placeholder={placeholder}
            autoComplete="off"
            enterKeyHint="search"
            maxLength={maxLength}
            className="min-h-10 w-full flex-1 rounded-xl border border-[hsl(var(--input,var(--border)))] bg-[hsl(var(--background))] px-3 py-2 pr-11 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] sm:pr-3"
          />

          <button
            type="submit"
            aria-label="Search"
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

        {tipText ? (
          <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            {tipText}
          </p>
        ) : null}
      </form>
    </section>
  );
}
