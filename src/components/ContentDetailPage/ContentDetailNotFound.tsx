import Link from "next/link";

type ContentDetailNotFoundProps = {
  contentType: "news" | "recall";
};

export default function ContentDetailNotFound({
  contentType,
}: ContentDetailNotFoundProps) {
  const isNews = contentType === "news";

  const backHref = isNews ? "/news" : "/recalls";
  const heading = isNews ? "News article not found" : "Recall not found";

  const message = isNews
    ? "This news article is no longer available in the GermFx database. It may have expired or been removed from the current news archive."
    : "This recall is no longer available in the GermFx database. It may have expired or been removed from the current recall data.";

  const backLabel = isNews ? "Return to Health News" : "Return to Recalls";

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <main className="mx-auto max-w-3xl px-2 py-8 sm:px-4 sm:py-12">
        <section className="border-0 bg-transparent p-0 text-center shadow-none sm:rounded-2xl sm:border sm:border-[hsl(var(--border))] sm:bg-[hsl(var(--card))] sm:p-8 sm:shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            404
          </p>

          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            {heading}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">
            {message}
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              href={backHref}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            >
              {backLabel}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}