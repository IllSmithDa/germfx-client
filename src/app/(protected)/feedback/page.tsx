// src/app/(protected)/feedback/page.tsx

import FeedbackButton from "@/components/UserFeedback/FeedbackButton";

export default function FeedbackPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-57px)] max-w-3xl px-4 py-8">
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm sm:p-8">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">
            SideFX feedback
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">
            Help improve SideFX
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            Share a bug report, feature request, or general feedback about your
            experience using the application.
          </p>

          <div className="mt-6">
            <FeedbackButton
              label="Open feedback form"
              defaultCategory="general"
              pageUrl="/feedback"
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90"
            />
          </div>
        </div>
      </section>
    </main>
  );
}