// app/(marketing)/privacy/page.tsx

export const metadata = {
  title: "Privacy Policy – SideFX.ai",
  description: "How SideFX.ai collects, uses, and protects your personal health data.",
};

const LAST_UPDATED = "March 2026";

const sections = [
  {
    number: "1",
    title: "Information We Collect",
    content: (
      <div className="space-y-3">
        <p>We collect only the information necessary to provide our service:</p>
        <ul className="space-y-1.5 pl-4">
          {[
            "Account details — your username and email address when you register.",
            "Symptom logs — symptom name, severity rating, date, notes, and any linked medication.",
            "Medication records — drug name, dosage, frequency, route, start and end dates.",
            "Usage data — basic analytics such as pages visited and features used, collected to improve the service.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-[hsl(var(--landing-fg-muted))]">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--landing-accent))]" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[hsl(var(--landing-fg-muted))]">
          We do <strong className="text-[hsl(var(--landing-fg))]">not</strong> collect
          sensitive health identifiers, insurance information, or clinical records.
        </p>
      </div>
    ),
  },
  {
    number: "2",
    title: "How We Use Your Data",
    content: (
      <div className="space-y-3">
        <p>Your data is used solely to:</p>
        <ul className="space-y-1.5 pl-4">
          {[
            "Provide and personalize the symptom tracking and reports features.",
            "Authenticate your account and maintain session security.",
            "Improve product functionality based on aggregated, anonymized usage patterns.",
            "Communicate important service or security updates.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-[hsl(var(--landing-fg-muted))]">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--landing-accent))]" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[hsl(var(--landing-fg-muted))]">
          We will never use your health data for advertising, profiling, or any
          purpose unrelated to the service described above.
        </p>
      </div>
    ),
  },
  {
    number: "3",
    title: "Data Ownership",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        You own your data. SideFX.ai does not sell, rent, or license your personal
        health data to any third party. Your symptom logs and medication records are
        yours, and they exist exclusively to serve you within this application.
      </p>
    ),
  },
  {
    number: "4",
    title: "Data Security",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        We implement reasonable and industry-standard safeguards including
        authentication protections, encrypted data transmission (HTTPS), and secure
        server-side storage. No system is completely immune to security risks, and
        while we take reasonable precautions, we cannot guarantee absolute security.
        We encourage you to use a strong, unique password for your account.
      </p>
    ),
  },
  {
    number: "5",
    title: "Cookies and Tracking",
    content: (
      <div className="space-y-3">
        <p className="text-[hsl(var(--landing-fg-muted))]">
          SideFX.ai uses session cookies to maintain your authenticated session.
          These are strictly functional — they are not used for advertising or
          cross-site tracking.
        </p>
        <p className="text-[hsl(var(--landing-fg-muted))]">
          We may use minimal, anonymized analytics to understand how the product is
          used. This data is never tied to your personal identity or health records.
        </p>
      </div>
    ),
  },
  {
    number: "6",
    title: "Data Retention",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        Your account data and logs are retained for as long as your account exists.
        You may request deletion of your account and associated data at any time.
        Upon deletion, your personal data is permanently removed from our systems
        within 30 days, except where retention is required by law.
      </p>
    ),
  },
  {
    number: "7",
    title: "Third-Party Services",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        SideFX.ai may use trusted third-party services for infrastructure (such as
        hosting and database providers). These providers are contractually obligated
        to handle your data securely and only as directed by us. We do not share
        your personal health data with any third party for their independent use.
      </p>
    ),
  },
  {
    number: "8",
    title: "Your Rights",
    content: (
      <div className="space-y-3">
        <p className="text-[hsl(var(--landing-fg-muted))]">You have the right to:</p>
        <ul className="space-y-1.5 pl-4">
          {[
            "Access the personal data we hold about you.",
            "Request correction of inaccurate data.",
            "Request deletion of your account and associated data.",
            "Export your symptom and medication data.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-[hsl(var(--landing-fg-muted))]">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--landing-accent))]" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[hsl(var(--landing-fg-muted))]">
          To exercise any of these rights, please contact us at{" "}
          <a
            href="mailto:privacy@sidefx.ai"
            className="text-[hsl(var(--landing-accent))] underline underline-offset-2 hover:opacity-80"
          >
            privacy@sidefx.ai
          </a>
          .
        </p>
      </div>
    ),
  },
  {
    number: "9",
    title: "Children's Privacy",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        SideFX.ai is not intended for use by individuals under 18 years of age. We
        do not knowingly collect personal data from minors. If you believe a minor
        has registered, please contact us and we will promptly remove the account.
      </p>
    ),
  },
  {
    number: "10",
    title: "Changes to This Policy",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        We may update this Privacy Policy from time to time. When we do, we will
        update the &ldquo;Last updated&ldquo; date at the top of this page. Continued use of SideFX.ai after changes constitutes your acceptance of the updated policy.
        For significant changes, we will notify registered users by email.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="landing-root min-h-screen">

      {/* Page header */}
      <div className="relative overflow-hidden px-6 py-16 md:py-24">
        <div className="landing-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-3xl">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-accent))]">
            Legal
          </span>
          <h1 className="landing-display text-4xl md:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-[hsl(var(--landing-fg-subtle))]">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[hsl(var(--landing-fg-muted))]">
            Your health data is sensitive. This policy explains exactly what we collect,
            why, and how we protect it.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          {/* Summary card */}
          <div className="mb-12 rounded-2xl border border-[hsl(var(--landing-accent)/0.25)] bg-[hsl(var(--landing-accent)/0.06)] p-6">
            <p className="text-sm font-semibold text-[hsl(var(--landing-fg))]">The short version</p>
            <ul className="mt-3 space-y-2">
              {[
                "We never sell your health data.",
                "You own everything you log.",
                "We only collect what's needed to run the service.",
                "You can delete your account and data at any time.",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-[hsl(var(--landing-fg-muted))]">
                  <svg className="h-4 w-4 shrink-0 text-[hsl(var(--landing-accent))]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,8 6.5,11.5 13,4.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map(({ number, title, content }) => (
              <section key={number}>
                <h2 className="landing-display mb-4 flex items-baseline gap-3 text-xl">
                  <span className="text-sm font-normal text-[hsl(var(--landing-accent))]">
                    {number}.
                  </span>
                  {title}
                </h2>
                <div className="text-sm leading-relaxed">{content}</div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
