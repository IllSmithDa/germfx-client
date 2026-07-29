// components/DrugSearchBar/DrugSearchBar.tsx

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
  mobileLayout = "stacked",
}: Props) {
  const controlLayoutClass =
    mobileLayout === "inline"
      ? "grid grid-cols-[minmax(0,1fr)_auto] items-stretch gap-2 sm:flex sm:flex-row sm:items-stretch"
      : mobileLayout === "adaptive"
        ? "flex flex-col gap-2 min-[440px]:grid min-[440px]:grid-cols-[minmax(0,1fr)_auto] min-[440px]:items-stretch sm:flex sm:flex-row sm:items-stretch"
        : "flex flex-col gap-2 sm:flex-row sm:items-stretch";

  const buttonClassName = [
    "h-11 shrink-0 cursor-pointer rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
    mobileLayout === "inline"
      ? "min-w-[5.25rem]"
      : mobileLayout === "adaptive"
        ? "w-full min-[440px]:w-auto min-[440px]:min-w-[5.25rem] sm:w-auto"
        : "w-full sm:w-auto",
  ].join(" ");

  return (
    <section className={className}>
      <form action={action}>
        <label htmlFor={inputId} className="sr-only">
          Search for a drug
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
                <circle cx="6.5" cy="6.5" r="4.5" />
                <line
                  x1="10.5"
                  y1="10.5"
                  x2="14"
                  y2="14"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <input
              id={inputId}
              name={inputName}
              type="text"
              placeholder={placeholder}
              autoComplete="off"
              maxLength={maxLength}
              className="h-11 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] pl-10 pr-3 text-sm outline-none transition-shadow placeholder:text-[hsl(var(--muted-foreground)/0.6)] focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))/0.3)] sm:pr-4"
            />
          </div>

          <button type="submit" className={buttonClassName} aria-label="Search">
            {buttonText}
          </button>
        </div>

        {tipText ? (
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            <svg
              className="mt-0.5 h-3 w-3 shrink-0 opacity-60"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="6" />
              <line x1="8" y1="7" x2="8" y2="11" strokeLinecap="round" />
              <circle
                cx="8"
                cy="5.5"
                r="0.5"
                fill="currentColor"
                stroke="none"
              />
            </svg>
            {tipText}
          </p>
        ) : null}
      </form>
    </section>
  );
}