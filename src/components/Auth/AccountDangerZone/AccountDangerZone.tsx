"use client";

import { useEffect, useState } from "react";

import { API_PROXY_PATHS } from "@/config/paths";
import DeactivateAccountCard from "./DeactivateAccountCard";
import DeleteAccountCard from "./DeleteAccountCard";

type AccountAuthCapabilities = {
  has_password: boolean;
  oauth_providers: string[];
};

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
      <div className="border-b border-[hsl(var(--border))] px-2 py-3 sm:px-4 sm:py-4">
        <h2 className="text-sm font-semibold text-rose-600 dark:text-rose-400">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-5 px-2 py-3 sm:px-4 sm:py-4">
        {children}
      </div>
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
  const [capabilities, setCapabilities] =
    useState<AccountAuthCapabilities | null>(null);
  const [capabilitiesError, setCapabilitiesError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCapabilities = async () => {
      try {
        const res = await fetch(
          API_PROXY_PATHS.me(),
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (!res.ok) {
          throw new Error(
            "Unable to load account authentication methods.",
          );
        }

        const data = await res.json();

        if (cancelled) return;

        setCapabilities({
          has_password:
            data?.has_password === true,
          oauth_providers: Array.isArray(
            data?.oauth_providers,
          )
            ? data.oauth_providers
                .filter(
                  (provider: unknown) =>
                    typeof provider === "string",
                )
                .map((provider: string) =>
                  provider.toLowerCase(),
                )
            : [],
        });
      } catch {
        if (!cancelled) {
          setCapabilitiesError(
            "Unable to determine your account verification method. Refresh the page and try again.",
          );
        }
      }
    };

    void loadCapabilities();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasPassword =
    capabilities?.has_password ?? false;

  const hasGoogle =
    capabilities?.oauth_providers.includes(
      "google",
    ) ?? false;

  const capabilitiesReady =
    capabilities !== null;

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

      {capabilitiesError ? (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          {capabilitiesError}
        </div>
      ) : null}

      {!capabilitiesReady &&
      !capabilitiesError ? (
        <div
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-5 text-center text-sm text-[hsl(var(--muted-foreground))]"
          role="status"
          aria-live="polite"
        >
          Loading account security
          options...
        </div>
      ) : capabilitiesReady ? (
        <div className="grid gap-4">
          <DeactivateAccountCard
            hasPassword={hasPassword}
            hasGoogle={hasGoogle}
            authCapabilitiesReady
          />

          <DeleteAccountCard
            hasPassword={hasPassword}
            hasGoogle={hasGoogle}
            authCapabilitiesReady
          />
        </div>
      ) : null}
    </SectionCard>
  );
}