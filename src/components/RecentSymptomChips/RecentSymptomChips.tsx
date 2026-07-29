export default function RecentSymptomChips({
  names,
  currentValue,
  onSelect,
  disabled,
}: {
  names: string[];
  currentValue: string;
  onSelect: (name: string) => void;
  disabled ?: boolean;
}) {
  if (!names.length) return null;

  return (
    <div className="mt-2.5">
      <div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
        Recent
      </div>

      <div className="flex flex-wrap gap-1.5">
        {names.slice(0, 8).map((name) => {
          const selected =
            currentValue.trim().toLowerCase() === name.trim().toLowerCase();

          return (
            <button
              key={name}
              disabled={disabled}
              type="button"
              onClick={() => onSelect(name)}
              aria-pressed={selected}
              className={[
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer",
                selected
                  ? "border-violet-400/60 bg-violet-500/15 text-violet-600 dark:text-violet-400"
                  : "border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]",
              ].join(" ")}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}