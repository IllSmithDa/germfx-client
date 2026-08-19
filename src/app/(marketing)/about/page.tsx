// app/(marketing)/about/page.tsx
import Link from "next/link";

export const metadata = {
  title: "About – GermFx",
  description:
    "Learn how GermFx helps you track your health, organize medications and symptoms, follow recalls, and understand trends over time.",
};

const features = [
  {
    title: "Track what matters",
    body: "Keep medications, symptoms, notes, and health activity organized in one place.",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M4 12h3l2-5 3 10 2-5h6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "See the bigger picture",
    body: "Use reports and trends to make your health history easier to review and understand.",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M4 19V9" strokeLinecap="round" />
        <path d="M10 19V5" strokeLinecap="round" />
        <path d="M16 19v-7" strokeLinecap="round" />
        <path d="M22 19H2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Stay informed",
    body: "Follow health news, recalls, and medication information without leaving the app.",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4z" />
        <path d="M9 8h5M9 12h5M9 16h3" strokeLinecap="round" />
        <path d="M18 8h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-1" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="landing-root min-h-screen">
      <div className="relative overflow-hidden px-6 py-16 md:py-20">
        <div
          className="landing-grid pointer-events-none absolute inset-0"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2 rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(210 80% 60%) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-accent))]">
            About GermFx
          </span>

          <h1 className="landing-display text-4xl leading-tight md:text-5xl">
            Your health, easier to keep track of.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[hsl(var(--landing-fg-muted))]">
            GermFx brings your personal health tracking, medication information,
            symptom history, reports, recalls, and health news together in one
            place.
          </p>
        </div>
      </div>

      <div className="px-6 pb-20">
        <div className="mx-auto max-w-3xl space-y-12">
          <section>
            <div className="grid gap-4 sm:grid-cols-3">
              {features.map(({ title, body, icon }) => (
                <div
                  key={title}
                  className="rounded-xl border border-[hsl(var(--landing-border))] bg-[hsl(220_25%_10%)] p-4"
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--landing-accent)/0.2)] bg-[hsl(var(--landing-accent)/0.12)] text-[hsl(var(--landing-accent))]">
                    {icon}
                  </div>

                  <h2 className="mb-1 text-sm font-semibold text-[hsl(var(--landing-fg))]">
                    {title}
                  </h2>

                  <p className="text-xs leading-relaxed text-[hsl(var(--landing-fg-muted))]">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-2xl text-center">
            <h2 className="landing-display text-2xl text-[hsl(var(--landing-fg))]">
              Built around your own health history.
            </h2>

            <p className="mt-3 leading-relaxed text-[hsl(var(--landing-fg-muted))]">
              GermFx is designed to make everyday health information easier to
              organize and revisit. The goal is simple: give you a clearer record
              of what has been happening over time and something useful to bring
              into conversations with your healthcare providers.
            </p>
          </section>

          <section className="mx-auto max-w-2xl">
            <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--landing-border))] bg-[hsl(220_25%_10%)] px-5 py-4">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--landing-accent))]"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="8" cy="8" r="6" />
                <line
                  x1="8"
                  y1="7"
                  x2="8"
                  y2="11"
                  strokeLinecap="round"
                />
                <circle
                  cx="8"
                  cy="5.5"
                  r="0.5"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>

              <p className="text-xs leading-relaxed text-[hsl(var(--landing-fg-muted))]">
                GermFx is a personal tracking and informational tool. It does not
                provide medical advice, diagnosis, or treatment. Health decisions
                should be discussed with a qualified healthcare professional.
              </p>
            </div>
          </section>

          <div className="text-center">
            <Link
              href="/register"
              className="landing-btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold"
            >
              Get started
              <svg
                className="h-4 w-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line
                  x1="3"
                  y1="8"
                  x2="13"
                  y2="8"
                  strokeLinecap="round"
                />
                <polyline
                  points="9,4 13,8 9,12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}