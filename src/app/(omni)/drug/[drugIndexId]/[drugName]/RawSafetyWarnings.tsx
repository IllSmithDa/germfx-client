type SafetyWarningsProps = {
  warningsText?: string | string[] | null;
  title?: string;
  initiallyOpen?: boolean;
};

function cleanWarningLines(warningsText?: string | string[] | null) {
  const rawLines = Array.isArray(warningsText)
    ? warningsText
    : typeof warningsText === "string" && warningsText.trim().length > 0
    ? [warningsText]
    : [];

  const out: string[] = [];
  const seen = new Set<string>();

  for (const line of rawLines) {
    const value = String(line || "").replace(/\s+/g, " ").trim();
    if (!value) continue;

    const key = value.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    out.push(value);
  }

  return out;
}

export default function RawSafetyWarnings({
  warningsText,
  title = "FDA label warnings",
  initiallyOpen = false,
}: SafetyWarningsProps) {
  const lines = cleanWarningLines(warningsText);
  const hasWarnings = lines.length > 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-[hsl(var(--border))] px-3 py-3 sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <svg
            className="h-4 w-4 shrink-0 text-amber-500"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M8 1.5L2 4.5v4c0 3 2.5 5.5 6 6 3.5-.5 6-3 6-6v-4L8 1.5z" />
            <line x1="8" y1="6" x2="8" y2="9" strokeLinecap="round" />
            <circle cx="8" cy="11" r="0.5" fill="currentColor" stroke="none" />
          </svg>

          <h2 className="min-w-0 truncate text-sm font-semibold">{title}</h2>
        </div>

        {lines.length > 0 ? (
          <span className="shrink-0 rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {lines.length}
          </span>
        ) : null}
      </div>

      <div className="px-3 py-3 sm:px-5 sm:py-4">
        {hasWarnings ? (
          <details className="group" open={initiallyOpen}>
            <summary className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-500/5 px-3 py-2.5 text-left transition-colors hover:bg-amber-500/10 list-none">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Show full FDA warning text
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                  Source label wording. This may be long, technical, or formatted for the original package label.
                </p>
              </div>

              <svg
                className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform duration-200 group-open:rotate-180"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <polyline points="4,6 8,10 12,6" />
              </svg>
            </summary>

            <div className="mt-3 space-y-3">
              {lines.map((line, i) => (
                <p
                  key={i}
                  className="whitespace-pre-wrap rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm leading-6 text-[hsl(var(--foreground)/0.85)] sm:px-4 sm:py-3"
                >
                  {line}
                </p>
              ))}
            </div>
          </details>
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Not available.
          </p>
        )}
      </div>
    </section>
  );
}