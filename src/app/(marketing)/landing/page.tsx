// app/(marketing)/page.tsx — Landing page
import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { getSessionUser } from "@/lib/helpers/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "GermFx – Understand Your Meds",
  description: "Log symptoms, detect trends, and generate doctor-ready reports.",
};

export default async function Landing() {
  const user = await getSessionUser();

  if (user) redirect("/home");
  
  return (
    <div className="landing-root min-h-screen text-[hsl(var(--landing-fg))]">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="min-h-[calc(100vh-57px)] relative overflow-hidden px-6 pt-24 pb-32 md:pt-32 md:pb-40">
        {/* Background grid texture */}
        <div className="landing-grid pointer-events-none absolute inset-0" aria-hidden />

        {/* Soft radial glow behind headline */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(210 80% 60%) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl">
          {/* Eyebrow */}
          <div className="landing-fade-1 mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--landing-accent)/0.3)] bg-[hsl(var(--landing-accent)/0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-accent))]">
              Personal health tracking
            </span>
          </div>

          {/* Headline */}
          <h1 className="landing-fade-2 landing-display mx-auto max-w-3xl text-center text-5xl leading-[1.1] tracking-tight md:text-7xl">
            Know what your<br />
            <em className="landing-em not-italic">medications</em><br />
            are doing to you.
          </h1>

          {/* Sub-headline */}
          <p className="landing-fade-3 mx-auto mt-8 max-w-xl text-center text-lg leading-relaxed text-[hsl(var(--landing-fg-muted))]">
            GermFx connects your symptoms to your medications — so you can log symptoms daily, monitor severity, identify possible triggers, and keep a timeline of how you are managing them.
          </p>

          {/* CTAs */}
          <div className="landing-fade-4 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="landing-btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[hsl(var(--landing-accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--landing-bg))]"
            >
              Start tracking
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
                <polyline points="9,4 13,8 9,12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="landing-btn-ghost inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[hsl(var(--landing-accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--landing-bg))]"
            >
              Sign in
            </Link>
          </div>

          {/* Trust footnote */}
          {/*
          <p className="landing-fade-4 mt-6 text-center text-xs text-[hsl(var(--landing-fg-subtle))]">
            Free to use · No credit card required · Your data stays private
          </p>*/}
        </div>

        {/* ECG line graphic */}
        <div className="landing-fade-5 relative mx-auto mt-20 max-w-4xl px-4">
          <svg
            viewBox="0 0 900 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            aria-hidden
          >
            {/* Glow filter */}
            <defs>
              <filter id="ecg-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Muted base line */}
            <line
              x1="0" y1="60" x2="900" y2="60"
              stroke="hsl(210 20% 30%)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />

            {/* ECG path — draws on load */}
            <path
              className="landing-ecg"
              d="M0,60 L120,60 L140,60 L155,20 L170,100 L185,10 L200,110 L215,60 L235,60 L255,60 L270,60 L285,30 L295,90 L305,60 L420,60 L440,60 L455,25 L470,95 L482,12 L496,108 L508,60 L528,60 L548,60 L563,35 L573,85 L583,60 L700,60 L720,60 L735,22 L750,98 L762,15 L776,105 L788,60 L808,60 L900,60"
              stroke="hsl(var(--landing-accent))"
              strokeWidth="2"
              filter="url(#ecg-glow)"
            />

            {/* Animated pulse dot */}
            <circle className="landing-ecg-dot" cx="788" cy="60" r="4" fill="hsl(var(--landing-accent))" />
          </svg>

          {/* Axis labels */}
          <div className="mt-3 flex justify-between text-[10px] text-[hsl(var(--landing-fg-subtle))] px-1">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ──────────────────────────────────────────── */}
      <div className="landing-strip border-y border-[hsl(var(--landing-border))] px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {[
            ["Track symptoms daily", "📋"],
            ["Link meds to side effects", "💊"],
            ["Export doctor reports", "📄"],
            ["Understand your patterns", "📊"],
          ].map(([text, emoji]) => (
            <span key={text} className="flex items-center gap-2 text-xs font-medium text-[hsl(var(--landing-fg-muted))]">
              <span>{emoji}</span>
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-[hsl(var(--border))] bg-[hsl(var(--background))] py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_45%)]" />
              
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-20 px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-500 dark:text-sky-300">
              More than medication tracking
            </div>
              
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
              A smarter way to understand your health patterns.
            </h2>
              
            <p className="mt-6 text-lg leading-8 text-[hsl(var(--muted-foreground))]">
              GermFx now combines symptom tracking, medication intelligence,
              FDA-backed safety information, reports, recalls, and health news
              into one organized experience.
            </p>
          </div>
              
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Symptom Tracking */}
            <div className="group relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 p-8 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              
              <div className="relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.5037 3.50368 12 4.125 12H6.375C6.99632 12 7.5 12.5037 7.5 13.125V20.25H3V13.125ZM9.75 3.75C9.75 3.12868 10.2537 2.625 10.875 2.625H13.125C13.7463 2.625 14.25 3.12868 14.25 3.75V20.25H9.75V3.75ZM16.5 8.625C16.5 8.00368 17.0037 7.5 17.625 7.5H19.875C20.4963 7.5 21 8.00368 21 8.625V20.25H16.5V8.625Z"
                    />
                  </svg>
                </div>
              
                <h3 className="mt-6 text-2xl font-semibold text-[hsl(var(--foreground))]">
                  Track symptoms over time
                </h3>
              
                <p className="mt-4 text-base leading-7 text-[hsl(var(--muted-foreground))]">
                  Log symptoms daily, monitor severity, identify possible
                  triggers, and keep track of how you are managing them.
                </p>
              
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "Severity tracking",
                    "Possible triggers",
                    "Management notes",
                    "Timeline history",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
                
            {/* Medication Intelligence */}
            <div className="group relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 p-8 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
              <div className="relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75m6 2.25a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                
                <h3 className="mt-6 text-2xl font-semibold text-[hsl(var(--foreground))]">
                  Research medications with FDA-backed data
                </h3>
                
                <p className="mt-4 text-base leading-7 text-[hsl(var(--muted-foreground))]">
                  Explore dosage information, side effects, warnings,
                  indications, and categorized safety information powered by
                  OpenFDA label data.
                </p>
                
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "Categorized side effects",
                    "Safety warnings",
                    "Dosage information",
                    "PDF exports",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-600 dark:text-sky-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
                
            {/* Reports */}
            <div className="group relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 p-8 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
              <div className="relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H5.625m0 0A3.375 3.375 0 0 0 2.25 5.625v12.75A3.375 3.375 0 0 0 5.625 21.75h12.75a3.375 3.375 0 0 0 3.375-3.375V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                </div>
                
                <h3 className="mt-6 text-2xl font-semibold text-[hsl(var(--foreground))]">
                  Generate doctor-ready reports
                </h3>
                
                <p className="mt-4 text-base leading-7 text-[hsl(var(--muted-foreground))]">
                  Create organized summaries of symptoms, medications,
                  triggers, and trends to help support conversations with
                  healthcare providers.
                </p>
                
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "PDF exports",
                    "Trend summaries",
                    "Symptom context",
                    "Medication history",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-600 dark:text-violet-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
                
            {/* News + Recalls */}
            <div className="group relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 p-8 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
              <div className="relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                    />
                  </svg>
                </div>
                
                <h3 className="mt-6 text-2xl font-semibold text-[hsl(var(--foreground))]">
                  Stay informed with recalls and health news
                </h3>
                
                <p className="mt-4 text-base leading-7 text-[hsl(var(--muted-foreground))]">
                  Monitor FDA recalls, medication-related news, and important
                  safety updates while saving and reacting to content that
                  matters to you.
                </p>
                
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "FDA recalls",
                    "Health news",
                    "Bookmarks",
                    "Reaction system",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-32 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, hsl(210 80% 50% / 0.12) 0%, transparent 65%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="landing-display mb-5 text-4xl leading-tight md:text-5xl">
            Your health deserves better tracking.
          </h2>
          <p className="mb-10 text-lg text-[hsl(var(--landing-fg-muted))]">
            No prescriptions needed. Try it out today!
          </p>
          {/*
          <p className="mb-10 text-lg text-[hsl(var(--landing-fg-muted))]">
            Free to use. No prescriptions needed. Just a clearer view of how your body responds to what you take.
          </p>
            */}
          <Link
            href="/register"
            className="landing-btn-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[hsl(var(--landing-accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--landing-bg))]"
          >
            Create your account
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
              <polyline points="9,4 13,8 9,12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/*
          <p className="mt-4 text-xs text-[hsl(var(--landing-fg-subtle))]">
            No credit card required
          </p>
          */}
        </div>
      </section>
      <Footer />
    </div>
  );
}
