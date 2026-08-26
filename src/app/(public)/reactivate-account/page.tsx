import Link from "next/link";
import ReactivateAccountForm from "@/components/Auth/ReactivateAccountForm/ReactivateAccountForm";

export default function ReactivateAccountPage() {
  return (
    <div className="landing-root min-h-[calc(100vh-57px)]">
      <div className="landing-grid pointer-events-none fixed inset-0" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, hsl(210 80% 60% / 0.12) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4 py-16">
        <Link
          href="/"
          className="landing-display mb-10 text-2xl font-bold text-[hsl(var(--landing-fg))] hover:opacity-80 transition-opacity"
        >
          Germ<span className="text-[hsl(var(--landing-accent))]">FX</span>
        </Link>

        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[hsl(220_20%_16%)] bg-[hsl(220_28%_9%)] shadow-2xl shadow-black/40">
          <div
            className="h-0.5 w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(210 80% 62%), transparent)",
            }}
          />

          <div className="px-8 py-8">
            <div className="mb-8 text-center">
              <h1 className="landing-display text-2xl font-bold text-[hsl(var(--landing-fg))]">
                Reactivate account
              </h1>
              <p className="mt-1.5 text-sm text-[hsl(var(--landing-fg-muted))]">
                Restore access to your deactivated account.
              </p>
            </div>

            <ReactivateAccountForm />
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[hsl(var(--landing-fg-subtle))]">
          For personal tracking only — not medical advice.
        </p>
      </div>
    </div>
  );
}