export const selectClass =
  "w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] sm:w-[220px] [&>option]:bg-[hsl(var(--card))] [&>option]:text-[hsl(var(--foreground))] cursor-pointer";

export const checkboxClass =
  "h-4 w-4 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))] cursor-pointer";

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-medium">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-[hsl(var(--border))] py-4 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-xl">
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="sm:min-w-[220px] sm:text-right">{control}</div>
    </div>
  );
}