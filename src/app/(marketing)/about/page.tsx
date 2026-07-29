// app/(marketing)/about/page.tsx
import Link from "next/link";

export const metadata = {
  title: "About – SideFX.ai",
  description:
    "Learn why SideFX.ai was built and how it helps people understand their medications.",
};

export default function AboutPage() {
  return (
    <div className="landing-root min-h-screen">

      {/* ── Page hero ── */}
      <div className="relative overflow-hidden px-6 py-20 md:py-28">
        <div className="landing-grid pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-72 w-[600px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(210 80% 60%) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-accent))]">
            Our story
          </span>
          <h1 className="landing-display text-4xl leading-tight md:text-5xl">
            Built for patients, not paperwork.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[hsl(var(--landing-fg-muted))]">
            SideFX.ai started with a simple frustration — it&apos;s too hard to
            track how medications actually affect your daily life.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-6 pb-24">
        <div className="mx-auto max-w-2xl space-y-16">

          {/* Why we exist */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[hsl(var(--landing-border))]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-accent))]">
                Why we exist
              </span>
              <div className="h-px flex-1 bg-[hsl(var(--landing-border))]" />
            </div>
            <div className="space-y-4 text-[hsl(var(--landing-fg-muted))] leading-relaxed">
              <p>
                When you start a new medication, your doctor gives you a list of
                possible side effects. But those lists are long, generic, and don&apos;t
                tell you what to expect <em>for you</em>. The experience of tracking
                symptoms across appointments, remembering when something started,
                or connecting a new symptom to a recent prescription change —
                that burden falls entirely on the patient.
              </p>
              <p>
                SideFX.ai gives that burden a home. A place to log how you feel,
                see what changed when, and walk into your next appointment with
                something concrete — not just &ldquo;I think it got worse around two weeks ago, maybe.&ldquo;
              </p>
            </div>
          </section>

          {/* What you can do */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[hsl(var(--landing-border))]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-accent))]">
                What you can do
              </span>
              <div className="h-px flex-1 bg-[hsl(var(--landing-border))]" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 8h2l2-5 2 10 2-5h2" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="3" y1="19" x2="21" y2="19" strokeLinecap="round" />
                    </svg>
                  ),
                  title: "Log daily symptoms",
                  body: "Capture how you feel with severity ratings, notes, and a linked medication.",
                },
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 3h12v5L12 13 6 8V3z" />
                      <path d="M6 8v13M18 8v13M6 21h12" />
                    </svg>
                  ),
                  title: "Search drug information",
                  body: "Look up FDA-sourced medication information, including side effects, warnings, and label details.",
                },
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="9" x2="9" y2="21" />
                    </svg>
                  ),
                  title: "Visualize trends",
                  body: "See symptom frequency and severity over time alongside your medication timeline.",
                },
                {
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                      <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  ),
                  title: "Track medication periods",
                  body: "Record start and end dates, dosage, and frequency for every treatment period.",
                },
              ].map(({ icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-xl border border-[hsl(var(--landing-border))] bg-[hsl(220_25%_10%)] p-4"
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--landing-accent)/0.12)] border border-[hsl(var(--landing-accent)/0.2)] text-[hsl(var(--landing-accent))]">
                    {icon}
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-[hsl(var(--landing-fg))]">
                    {title}
                  </h3>
                  <p className="text-xs leading-relaxed text-[hsl(var(--landing-fg-muted))]">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Our goal */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[hsl(var(--landing-border))]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-accent))]">
                Our commitment
              </span>
              <div className="h-px flex-1 bg-[hsl(var(--landing-border))]" />
            </div>
            <div className="space-y-4 text-[hsl(var(--landing-fg-muted))] leading-relaxed">
              <p>
                We believe your health data belongs to you — not advertisers, not
                data brokers. SideFX.ai does not sell your information. The data
                you log exists for one purpose: to help you understand your own
                health story.
              </p>
              <p>
                We&apos;re building toward a future where patients walk into appointments
                armed with data, not just memories. SideFX is a tool for informed
                conversations, not a replacement for clinical care.
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--landing-border))] bg-[hsl(220_25%_10%)] px-5 py-4">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--landing-accent))]"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="8" cy="8" r="6" />
              <line x1="8" y1="7" x2="8" y2="11" strokeLinecap="round" />
              <circle cx="8" cy="5.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
            <p className="text-xs leading-relaxed text-[hsl(var(--landing-fg-muted))]">
              SideFX.ai is a personal tracking tool and does not constitute medical
              advice, diagnosis, or treatment. Always consult a licensed healthcare
              professional regarding your medications and health decisions.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/register"
              className="landing-btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold"
            >
              Start tracking free
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
                <polyline points="9,4 13,8 9,12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
