import Link from "next/link";
import { SectionCard } from "./SettingsUI"

export default function DataShortcuts() {
  return (
    <SectionCard
      title="Data & Shortcuts"
      description="Quick links to useful account and export areas."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/reports"
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm font-medium hover:bg-[hsl(var(--muted))]"
        >
          View reports
        </Link>

        <Link
          href="/bookmarks"
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm font-medium hover:bg-[hsl(var(--muted))]"
        >
          View bookmarks
        </Link>
      </div>
    </SectionCard>
  );
}