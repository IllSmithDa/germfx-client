// components/HeroGraphic.tsx
"use client";

export default function HeroGraphic() {
  return (
    <div className="relative mx-auto aspect-[16/10] w-full max-w-4xl">
      {/* Glow blob */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-[2rem] blur-2xl
                   bg-[radial-gradient(40%_40%_at_50%_50%,hsl(var(--primary))/0.25,transparent_70%)]
                   dark:bg-[radial-gradient(40%_40%_at_50%_50%,hsl(var(--primary))/0.15,transparent_70%)]"
      />
      {/* Mock “card” stack */}
      <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Recent log</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[hsl(var(--foreground))]">Nausea</span>
              <span className="rounded-md bg-[hsl(var(--accent))] px-2 py-0.5 text-[hsl(var(--accent-foreground))]">3/10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[hsl(var(--foreground))]">Headache</span>
              <span className="rounded-md bg-[hsl(var(--accent))] px-2 py-0.5 text-[hsl(var(--accent-foreground))]">2/10</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Insight</div>
          <div className="text-sm">
            <p className="font-medium">Nausea decreased 20% WoW</p>
            <p className="text-[hsl(var(--muted-foreground))]">Avg score fell from 5 → 4 this week.</p>
          </div>
        </div>

        <div className="col-span-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Adherence (last 14 days)</div>
          <div className="h-24 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]" />
        </div>
      </div>
    </div>
  );
}
