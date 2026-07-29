// components/dashboard/RecentLogs.tsx
import { SymptomLog } from "../../types";

export function RecentLogs({ logs }: { logs: SymptomLog[] }) {
  return (
    <ul className="space-y-3">
      {logs.map((l) => (
        <li
          key={l.id}
          className="
            flex items-start justify-between gap-3 rounded-xl
            border border-[hsl(var(--border))] p-3
            bg-[hsl(var(--card))] shadow-sm
            hover:opacity-95 transition-opacity
            focus-within:ring-2 focus-within:ring-[hsl(var(--ring))]
          "
        >
          <div>
            <div className="text-sm font-medium text-[hsl(var(--foreground))]">
              {l.symptom}{" "}
              <span className="text-[hsl(var(--muted-foreground))]">•</span>{" "}
              <span className="text-[hsl(var(--muted-foreground))]">{l.medication}</span>
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{l.date}</div>
            {l.note && (
              <div className="mt-1 text-sm text-[hsl(var(--foreground))]">{l.note}</div>
            )}
          </div>

          <span
            className="
              shrink-0 rounded-md px-2 py-1 text-xs font-medium
              bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]
              border border-[hsl(var(--border))]
            "
            aria-label={`severity ${l.severity} of 10`}
          >
            severity {l.severity}/10
          </span>
        </li>
      ))}

      {logs.length === 0 && (
        <li
          className="
            rounded-xl border border-[hsl(var(--border))] p-6 text-center
            bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] shadow-sm
          "
        >
          No logs yet.
        </li>
      )}
    </ul>
  );
}
