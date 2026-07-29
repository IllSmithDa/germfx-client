export default function SeverityPicker({
  value,
  onChange,
  disabled = false,  
}: {
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5" >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const active = value === n;
          // 1–3 mild (emerald), 4–6 moderate (amber), 7–10 severe (rose)
          const colorClass =
            n <= 3
              ? active
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "border-emerald-400/30 text-emerald-600/70 dark:text-emerald-400/60 hover:bg-emerald-500/10"
              : n <= 6
              ? active
                ? "border-amber-400 bg-amber-500/20 text-amber-600 dark:text-amber-400"
                : "border-amber-400/30 text-amber-600/70 dark:text-amber-400/60 hover:bg-amber-500/10"
              : active
              ? "border-rose-400 bg-rose-500/20 text-rose-600 dark:text-rose-400"
              : "border-rose-400/30 text-rose-600/70 dark:text-rose-400/60 hover:bg-rose-500/10";
          return (
            <button
              disabled={disabled}
              key={n}
              type="button"
              onClick={() => {
                if (disabled === false) {
                  onChange(active ? null : n)
                }
              }}
              className={[
                "h-8 w-8 rounded-lg border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer",
                colorClass,
              ].join(" ")}
              aria-label={`Severity ${n}${active ? " (selected, click to clear)" : ""}`}
              aria-pressed={active}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between px-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
        <span>Mild</span>
        <span>Moderate</span>
        <span>Severe</span>
      </div>
    </div>
  );
}