import ShowMoreList from "@/components/ShowMoreList/ShowMoreList";

type Props = {
  items: string[];
  initiallyOpen?: boolean;
};

function dedupe(items: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const item of items || []) {
    const value = String(item || "").replace(/\s+/g, " ").trim();
    if (!value) continue;

    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }

  return out;
}

function hasRepeatedPhrase(text: string) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (words.length < 24) return false;

  const seen = new Set<string>();

  for (let i = 0; i <= words.length - 7; i += 1) {
    const phrase = words.slice(i, i + 7).join(" ");
    if (seen.has(phrase)) return true;
    seen.add(phrase);
  }

  return false;
}

function getQualityFlags(items: string[]) {
  const fullText = items.join(" ");
  const hasLongParagraph = items.some(
    (item) => item.length > 520 || item.split(/\s+/).length > 90,
  );
  const hasFewHugeItems = items.length <= 2 && fullText.length > 650;
  const hasRepetition = hasRepeatedPhrase(fullText);

  const reasons: string[] = [];

  if (hasLongParagraph || hasFewHugeItems) {
    reasons.push("large label paragraphs");
  }

  if (hasRepetition) {
    reasons.push("repeated wording");
  }

  return {
    isMessy: reasons.length > 0,
    reasons,
  };
}

function emphasizeIndications(text: string) {
  return text
    .replace(/\b(Adults?|Pediatric patients?|Children)\b/gi, "<strong>$1</strong>")
    .replace(/\b(HeFH|HoFH|LDL-C|CHD|MI)\b/g, "<strong>$1</strong>");
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[hsl(var(--border))] px-3 py-3 sm:px-5 sm:py-3.5">
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <h2 className="min-w-0 truncate text-sm font-semibold">{title}</h2>
      </div>

      {count != null && count > 0 && (
        <span className="shrink-0 rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
          {count}
        </span>
      )}
    </div>
  );
}

const IndicationsIcon = () => (
  <svg
    className="h-4 w-4 shrink-0 text-sky-400"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path d="M3 3h10M3 6h7M3 9h10M3 12h5" strokeLinecap="round" />
  </svg>
);

export default function IndicationsPanel({
  items,
  initiallyOpen = false,
}: Props) {
  const cleaned = dedupe(items || []);
  const head = cleaned.slice(0, 3).map(emphasizeIndications);
  const tail = cleaned.slice(3).map(emphasizeIndications);
  const quality = getQualityFlags(cleaned);

  return (
    <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <SectionHeader
        icon={<IndicationsIcon />}
        title="Professional label: Usage and Indications"
        count={cleaned.length}
      />

      <div className="px-3 py-3 sm:px-5 sm:py-4">
        {cleaned.length > 0 ? (
          <details className="group" open={initiallyOpen}>
            <summary className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-xl border border-sky-400/25 bg-sky-500/5 px-3 py-2.5 text-left transition-colors hover:bg-sky-500/10 list-none">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Show FDA label use text
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                  Technical label wording. It may be incomplete, repetitive, or written for clinicians.
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

            {quality.isMessy ? (
              <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-500/5 px-3 py-2 text-xs leading-5 text-amber-700 dark:text-amber-300">
                This label section may be messy because it contains {quality.reasons.join(" and ")}. Use it as source-label context, not as a simplified explanation.
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-3 py-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                This is original FDA label wording organized for display. It is not a plain-language summary.
              </p>
            )}

            <div className="mt-3">
              <ShowMoreList head={head} tail={tail} />
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