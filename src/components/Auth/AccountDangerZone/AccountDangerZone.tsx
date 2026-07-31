"use client";

import DeactivateAccountCard from "./DeactivateAccountCard";
import DeleteAccountCard from "./DeleteAccountCard";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-rose-500/30 bg-[hsl(var(--card))] shadow-sm">
      <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500 opacity-70" />
      <div className="border-b border-[hsl(var(--border))] px-2 sm:px-4 py-3 sm:py-4">
        <h2 className="text-sm font-semibold text-rose-600 dark:text-rose-400">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-5 px-2 sm:px-4 py-3 sm:py-4">{children}</div>
    </section>
  );
}

function WarningBox({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-xl border border-rose-400/30 bg-rose-500/8 px-4 py-3">
      <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
        {title}
      </p>
      <ul className="mt-2 space-y-1 text-sm text-rose-700/90 dark:text-rose-300/90">
        {lines.map((line) => (
          <li key={line}>• {line}</li>
        ))}
      </ul>
    </div>
  );
}

export default function AccountDangerZone() {
  return (
    <SectionCard
      title="Danger Zone"
      description="These actions affect account access and may permanently remove your data."
    >
      <WarningBox
        title="Please read before continuing"
        lines={[
          "Deactivating your account signs you out and blocks future logins until it is reactivated.",
          "Deleting your account may permanently remove your health logs, medications, and related account data.",
          "These actions should only be used if you are sure you want to restrict or remove access.",
        ]}
      />

      <div className="grid gap-4">
        <DeactivateAccountCard />
        <DeleteAccountCard />
      </div>
    </SectionCard>
  );
}