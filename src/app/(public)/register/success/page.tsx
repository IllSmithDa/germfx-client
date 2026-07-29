// app/(auth)/register/success/page.tsx
import Link from "next/link";

type Props = {
  searchParams: Promise<{
    email?: string;
    username?: string;
  }>;
};

export default async function RegisterSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const email = params.email ?? "";
  const username = params.username ?? "";

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

      <div className="relative flex min-h-[calc(100vh-149px)] flex-col items-center justify-center px-4 py-16">
        <Link
          href="/"
          className="landing-display mb-10 text-2xl font-bold text-[hsl(var(--landing-fg))] hover:opacity-80 transition-opacity"
        >
          Side<span className="text-[hsl(var(--landing-accent))]">FX</span>.ai
        </Link>

        <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[hsl(220_20%_16%)] bg-[hsl(220_28%_9%)] shadow-2xl shadow-black/40">
          <div
            className="h-0.5 w-full"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(210 80% 62%), transparent)",
            }}
          />

          <div className="px-8 py-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-400">
              <svg className="h-7 w-7" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8" cy="8" r="6" />
                <polyline points="5,8 7,10 11,6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="mt-5 text-center">
              <h1 className="landing-display text-2xl font-bold text-[hsl(var(--landing-fg))]">
                Welcome to SideFX
              </h1>
              <p className="mt-2 text-sm text-[hsl(var(--landing-fg-muted))]">
                Your account has been created successfully.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-[hsl(220_20%_18%)] bg-[hsl(220_25%_12%)] p-5">
              <p className="text-sm text-[hsl(var(--landing-fg-muted))]">
                {username ? (
                  <>
                    Thanks for signing up,{" "}
                    <span className="font-semibold text-[hsl(var(--landing-fg))]">
                      {username}
                    </span>
                    .
                  </>
                ) : (
                  "Thanks for signing up."
                )}
              </p>

              <p className="mt-3 text-sm text-[hsl(var(--landing-fg-muted))]">
                We’ve sent a verification email to{" "}
                <span className="font-medium text-[hsl(var(--landing-fg))]">
                  {email || "your email address"}
                </span>
                .
              </p>

              <div className="mt-5 space-y-2 text-sm text-[hsl(var(--landing-fg-muted))]">
                <p>Here’s what happens next:</p>
                <ul className="space-y-2">
                  <li>• Open your inbox and click the verification link.</li>
                  <li>• After verification, return to SideFX and sign in.</li>
                  <li>• Start tracking medications, symptoms, and reports in one place.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[hsl(210_80%_62%/0.2)] bg-[hsl(210_80%_62%/0.08)] px-4 py-3 text-sm text-[hsl(var(--landing-fg-muted))]">
              Did not receive the email? Check your spam folder first. You can also add a resend verification option later if you want.
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="landing-btn-primary inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold"
              >
                Go to Login
              </Link>

              <Link
                href="/"
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-[hsl(220_20%_20%)] bg-[hsl(220_25%_12%)] px-4 py-3 text-sm font-semibold text-[hsl(var(--landing-fg-muted))] transition hover:border-[hsl(210_80%_62%/0.35)] hover:text-[hsl(var(--landing-fg))]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[hsl(var(--landing-fg-subtle))]">
          Your data is private and never sold.
        </p>
      </div>
    </div>
  );
}