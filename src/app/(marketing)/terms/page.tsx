// app/(marketing)/terms/page.tsx
export const metadata = {
  title: "Terms of Service – GermFx",
  description: "The terms and conditions governing your use of GermFx.",
};

const LAST_UPDATED = "March 2026";

const sections = [
  {
    number: "1",
    title: "Acceptance of Terms",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        By creating an account or using GermFx, you agree to these Terms of
        Service. If you do not agree, please do not use the service. These terms
        apply to all visitors, registered users, and others who access or use
        GermFx.
      </p>
    ),
  },
  {
    number: "2",
    title: "Description of Service",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        GermFx is a personal health tracking application that allows users to log
        symptoms, track medication usage, search drug information, and generate
        trend reports. The service is provided as-is for personal informational
        use only.
      </p>
    ),
  },
  {
    number: "3",
    title: "Not Medical Advice",
    content: (
      <div className="space-y-3">
        <p className="text-[hsl(var(--landing-fg-muted))]">
          GermFx is <strong className="text-[hsl(var(--landing-fg))]">not a medical service</strong>.
          Nothing on GermFx constitutes medical advice, diagnosis, or treatment
          recommendations. The information provided — including drug data, symptom
          trends, and reports — is for personal tracking and informational purposes
          only.
        </p>
        <p className="text-[hsl(var(--landing-fg-muted))]">
          Always consult a qualified, licensed healthcare professional before making
          any decisions about your medications, treatment, or health. Do not
          disregard or delay seeking professional medical advice based on anything
          you read or track within GermFx.
        </p>
      </div>
    ),
  },
  {
    number: "4",
    title: "User Accounts",
    content: (
      <div className="space-y-3">
        <p className="text-[hsl(var(--landing-fg-muted))]">
          To use most features of GermFx, you must register for an account. You
          agree to:
        </p>
        <ul className="space-y-1.5 pl-4">
          {[
            "Provide accurate and truthful information when creating your account.",
            "Keep your password confidential and not share it with others.",
            "Notify us immediately if you suspect unauthorized access to your account.",
            "Be responsible for all activity that occurs under your account.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-[hsl(var(--landing-fg-muted))]">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--landing-accent))]" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    number: "5",
    title: "Acceptable Use",
    content: (
      <div className="space-y-3">
        <p className="text-[hsl(var(--landing-fg-muted))]">You agree not to:</p>
        <ul className="space-y-1.5 pl-4">
          {[
            "Use GermFx for any unlawful or fraudulent purpose.",
            "Attempt to gain unauthorized access to any part of the service or its infrastructure.",
            "Scrape, harvest, or systematically copy content or data from the service.",
            "Interfere with or disrupt the integrity or performance of the service.",
            "Impersonate any person or entity, or falsely represent your affiliation.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-[hsl(var(--landing-fg-muted))]">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500/60" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    number: "6",
    title: "Data and Privacy",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        Your use of GermFx is also governed by our{" "}
        <a href="/privacy" className="text-[hsl(var(--landing-accent))] underline underline-offset-2 hover:opacity-80">
          Privacy Policy
        </a>
        , which is incorporated into these Terms by reference. By using GermFx,
        you agree to the collection and use of your information as described in that
        policy. You own your data and may request its deletion at any time.
      </p>
    ),
  },
  {
    number: "7",
    title: "Intellectual Property",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        The GermFx name, logo, design, and product code are the intellectual
        property of GermFx and its developers. You may not copy, reproduce, or
        distribute any part of the service without explicit written permission. Your
        personal data (logs, notes, records) belongs to you and is not claimed by us.
      </p>
    ),
  },
  {
    number: "8",
    title: "Limitation of Liability",
    content: (
      <div className="space-y-3">
        <p className="text-[hsl(var(--landing-fg-muted))]">
          GermFx is provided &ldquo;as is&ldquo; and &ldquo;as available&ldquo; without warranties of any kind, express or implied. We do not warrant that the service will be uninterrupted, error-free, or completely secure.
        </p>
        <p className="text-[hsl(var(--landing-fg-muted))]">
          To the maximum extent permitted by law, GermFx and its developers shall
          not be liable for any indirect, incidental, special, consequential, or
          punitive damages — including but not limited to health outcomes, data loss,
          or service interruption — arising from your use of or inability to use the
          service.
        </p>
      </div>
    ),
  },
  {
    number: "9",
    title: "Account Termination",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        You may delete your account at any time through the settings page. We
        reserve the right to suspend or terminate accounts that violate these Terms,
        engage in abusive behavior, or create legal or security risks. Upon
        termination, your data will be handled in accordance with our Privacy Policy.
      </p>
    ),
  },
  {
    number: "10",
    title: "Governing Law",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        These Terms are governed by and construed in accordance with the laws of the
        United States. Any disputes arising under these Terms shall be subject to the
        exclusive jurisdiction of the applicable courts. If any provision of these
        Terms is found to be unenforceable, the remaining provisions will continue
        in full force.
      </p>
    ),
  },
  {
    number: "11",
    title: "Changes to These Terms",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        We may revise these Terms from time to time. When we do, we will update the
        date at the top of this page. Continued use of GermFx after updates
        constitutes your acceptance of the revised Terms. For material changes,
        registered users will be notified by email.
      </p>
    ),
  },
  {
    number: "12",
    title: "Contact",
    content: (
      <p className="text-[hsl(var(--landing-fg-muted))]">
        Questions about these Terms? Contact us at{" "}
        <a
          href="mailto:legal@GermFx"
          className="text-[hsl(var(--landing-accent))] underline underline-offset-2 hover:opacity-80"
        >
          legal@GermFx
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="landing-root min-h-screen">
      {/* Page header */}
      <div className="relative overflow-hidden px-6 py-16 md:py-24">
        <div className="landing-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-3xl">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-[hsl(var(--landing-accent))]">
            Legal
          </span>
          <h1 className="landing-display text-4xl md:text-5xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-[hsl(var(--landing-fg-subtle))]">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[hsl(var(--landing-fg-muted))]">
            Please read these terms carefully before using GermFx. They govern
            your access and use of the service.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          {/* Medical disclaimer callout */}
          <div className="mb-12 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/6 px-5 py-4">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M8 2L1.5 13.5h13L8 2z" />
              <line x1="8" y1="7" x2="8" y2="10" strokeLinecap="round" />
              <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none" />
            </svg>
            <p className="text-sm leading-relaxed text-amber-200/80">
              GermFx is not a medical service. Nothing in this application constitutes
              medical advice or diagnosis. Always consult a licensed healthcare professional
              for medical decisions.
            </p>
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
