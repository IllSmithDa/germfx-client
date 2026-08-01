// src/app/(protected)/account/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/helpers/getCurrentUser";
import AccountSettingsForms from "@/components/AccountSettings/AccountSettingsForm";
import AccountDangerZone from "@/components/Auth/AccountDangerZone/AccountDangerZone";
import AccountSubscriptionSection from "@/components/AccountSettings/AccountSubscriptionSection";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user || !user?.id) redirect("/login");

  const initials =
    user.username
      ?.trim()
      ?.split(/\s+/)
      .slice(0, 2)
      .map((s: string) => s[0]?.toUpperCase())
      .join("") ||
    user.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="mx-auto max-w-5xl space-y-3 sm:space-y-6 px-2 sm:px-4 py-2 sm:py-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold">Account</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage your profile, security, and account access.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
          <div className="h-0.5 w-full bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500 opacity-60" />

          <div className="flex items-center gap-4 p-2 sm:p-4">
            <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full border-2 border-sky-400/30 bg-sky-500/15 text-md sm:text-lg font-bold text-sky-600 dark:text-sky-400">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs sm:text-base font-semibold text-[hsl(var(--foreground))]">
                {user.username || "—"}
              </p>
              <p className="truncate text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
                {user.email || "—"}
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-green-400/40 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 divide-x divide-[hsl(var(--border))] border-t border-[hsl(var(--border))]">
            <div className="px-2 sm:px-4 py-3 sm:py-4">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                Username
              </p>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-[hsl(var(--foreground))]">
                {user.username || "—"}
              </p>
            </div>
            <div className="px-2 sm:px-4 py-3 sm:py-4">
              <p className="text-xs sm:text-sm text-xs sm:text-sm font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                Email
              </p>
              <p className="mt-0.5 truncate text-xs sm:text-sm font-medium text-[hsl(var(--foreground))]">
                {user.email || "—"}
              </p>
            </div>
          </div>
        </section>

        <AccountSubscriptionSection user={user} />

        <AccountSettingsForms
          currentUsername={user.username ?? ""}
          currentEmail={user.email ?? ""}
        />
        <AccountDangerZone />
      </div>
    </div>
  );
}