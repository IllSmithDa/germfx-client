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
    <div className="w-full space-y-2">
      <div className="grid w-full grid-cols-10 gap-1 sm:gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const active = value === n;

          // 1–3 mild, 4–6 moderate, 7–10 severe
          const colorClass =
            n <= 3
              ? active
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "border-emerald-400/30 text-emerald-600/70 hover:bg-emerald-500/10 dark:text-emerald-400/60"
              : n <= 6
                ? active
                  ? "border-amber-400 bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  : "border-amber-400/30 text-amber-600/70 hover:bg-amber-500/10 dark:text-amber-400/60"
                : active
                  ? "border-rose-400 bg-rose-500/20 text-rose-600 dark:text-rose-400"
                  : "border-rose-400/30 text-rose-600/70 hover:bg-rose-500/10 dark:text-rose-400/60";

          return (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  onChange(active ? null : n);
                }
              }}
              className={[
                "flex h-8 min-w-0 w-full cursor-pointer items-center justify-center rounded-lg border px-0",
                "text-[11px] font-semibold transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                "disabled:cursor-not-allowed disabled:opacity-60",
                colorClass,
              ].join(" ")}
              aria-label={`Severity ${n}${
                active ? " (selected, click to clear)" : ""
              }`}
              aria-pressed={active}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="grid w-full grid-cols-10 gap-1 text-[10px] leading-none text-[hsl(var(--muted-foreground))] sm:gap-1.5">
        <span className="col-span-3 text-center">Mild</span>
        <span className="col-span-3 text-center">Moderate</span>
        <span className="col-span-4 text-center">Severe</span>
      </div>
    </div>
  );
}