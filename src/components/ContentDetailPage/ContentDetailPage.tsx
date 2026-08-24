import Image from "next/image";
import Link from "next/link";

import ContentReactionBar from "@/components/ContentReactionBar/ContentReactionBar";
import ContentShareButton from "@/components/ContentShareButton/ContentShareButton";
import SaveNewsButton from "@/components/SaveNewsButton/SaveNewsButton";
import SaveRecallButton from "@/components/SaveRecallButton/SaveRecallButton";

import type { NewsArticle } from "@/lib/server/articlesServerApi";
import type { ReactionSummary } from "@/lib/client/reactionApi";
import type { RecallItem } from "@/types/recalls";  
import { CLIENT_PATHS } from "@/config/paths";

type SharedProps = {
  initialReactionSummary?: ReactionSummary;
  initialSaved?: boolean;
  initialSavedItemId?: number | null;
  userId?: number | string | null;
};

type NewsDetailArticle = NewsArticle & {
  description?: string | null;
};

type ContentDetailPageProps =
  | (SharedProps & { contentType: "news"; item: NewsDetailArticle })
  | (SharedProps & { contentType: "recall"; item: RecallItem });

function formatDate(value?: string | null) {
  if (!value) return null;

  if (/^\d{8}$/.test(value)) {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);
    const parsed = new Date(`${year}-${month}-${day}T00:00:00`);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return value;
}

function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex min-h-6 max-w-full items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm leading-6 text-[hsl(var(--foreground))]">
        {value}
      </dd>
    </div>
  );
}

function recallSourceLabel(source?: string | null) {
  if (source === "food") return "Food Recall";
  if (source === "drug") return "Medication Recall";
  return "Recall";
}

function recallSourceTone(source?: string | null) {
  if (source === "food") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }
  if (source === "drug") {
    return "border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-400";
  }
  return "border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
}

function classificationTone(classification?: string | null) {
  const value = (classification ?? "").toLowerCase();

  if (value.includes("class i")) {
    return "border-rose-400/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";
  }
  if (value.includes("class ii")) {
    return "border-amber-400/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
  if (value.includes("class iii")) {
    return "border-slate-400/30 bg-slate-500/10 text-slate-600 dark:text-slate-300";
  }

  return "border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
}

function statusTone(status?: string | null) {
  const value = (status ?? "").toLowerCase();

  if (value.includes("ongoing")) {
    return "border-amber-400/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
  if (value.includes("terminated") || value.includes("completed")) {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }

  return "border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
}

function getNewsInitial(title: string) {
  const trimmed = title.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "N";
}

function DetailArticleImage({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl?: string | null;
}) {
  const mediaClassName =
    "relative mt-5 flex aspect-video w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-blue-500/10 shadow-sm";

  if (imageUrl) {
    return (
      <div className={mediaClassName}>
        <Image
          src={imageUrl}
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 100vw, 768px"
          className="object-cover transition-transform duration-200 group-hover/image:scale-[1.02]"
        />
      </div>
    );
  }

  return (
    <div className={`${mediaClassName} items-center justify-center`}>
      <span className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
        {getNewsInitial(title)}
      </span>
    </div>
  );
}

export default function ContentDetailPage(props: ContentDetailPageProps) {
  const isNews = props.contentType === "news";
  const backHref = isNews ? "/news" : "/recalls";
  const backLabel = isNews ? "Back to Health News" : "Back to Recalls";

  const newsDescription =
    props.contentType === "news"
      ? props.item.summary ?? props.item.description ?? null
      : null;

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <main className="mx-auto max-w-3xl px-2 py-4 sm:px-4 sm:py-8">
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
        >
          ← {backLabel}
        </Link>

        <article className="border-0 bg-transparent p-0 shadow-none sm:rounded-2xl sm:border sm:border-[hsl(var(--border))] sm:bg-[hsl(var(--card))] sm:p-6 sm:shadow-sm">
          {props.contentType === "news" ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  News
                </Badge>

                {props.item.source ? (
                  <Badge className="border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                    {props.item.source}
                  </Badge>
                ) : null}

                {formatDate(props.item.published_at) ? (
                  <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
                    {formatDate(props.item.published_at)}
                  </span>
                ) : null}
              </div>

              <Link
                href={props.item.url}
                target="_blank"
                rel="noreferrer"
                className="group/title mt-4 block rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--card))]"
              >
                <h1 className="text-md sm:text-xl font-bold leading-6 transition-colors group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 sm:leading-8">
                  {props.item.title}
                </h1>
              </Link>

              <Link
                href={props.item.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Read article: ${props.item.title}`}
                className="group/image block rounded-2xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--card))]"
              >
                <DetailArticleImage
                  title={props.item.title}
                  imageUrl={props.item.image_url}
                />
              </Link>

              {newsDescription ? (
                <section className="mt-5">
                  <Link
                    href={props.item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group/description mt-2 block rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--card))]"
                  >
                    <p className="whitespace-pre-line text-sm text-[hsl(var(--muted-foreground))] transition-colors group-hover/description:text-[hsl(var(--foreground))] sm:text-base">
                      {newsDescription}
                    </p>
                  </Link>
                </section>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[hsl(var(--border))] pt-4">
                {props.item.url ? (
                  <Link
                    href={props.item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden md:inline-flex min-h-9 items-center justify-center rounded-lg border border-sky-400/35 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] dark:text-sky-400 sm:text-sm"
                  >
                    Read original article
                  </Link>
                ) : null}

                <SaveNewsButton
                  articleId={props.item.id}
                  initialSaved={props.initialSaved}
                  initialSavedItemId={props.initialSavedItemId}
                  userId={props.userId}
                />

                <ContentReactionBar
                  contentType="news"
                  sourceItemId={props.item.id}
                  initialSummary={props.initialReactionSummary}
                  userId={props.userId}
                />
                
                <ContentShareButton
                  title={props.item.title}
                  text={newsDescription ?? undefined}
                  shareUrl={CLIENT_PATHS.newsDetailPath(props.item.id)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={recallSourceTone(props.item.source)}>
                  {recallSourceLabel(props.item.source)}
                </Badge>

                {props.item.classification ? (
                  <Badge className={classificationTone(props.item.classification)}>
                    {props.item.classification}
                  </Badge>
                ) : null}

                {props.item.status ? (
                  <Badge className={statusTone(props.item.status)}>
                    {props.item.status}
                  </Badge>
                ) : null}

                {formatDate(props.item.report_date || props.item.recall_date) ? (
                  <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
                    {formatDate(props.item.report_date || props.item.recall_date)}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-md sm:text-xl font-bold leading-8 sm:text-3xl sm:leading-10">
                {props.item.title}
              </h1>

              {props.item.reason ? (
                <section className="mt-5">
                  <h2 className="text-sm font-semibold">Reason for recall</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:text-base">
                    {props.item.reason}
                  </p>
                </section>
              ) : null}

              <dl className="mt-6 grid gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/25 p-4 sm:grid-cols-2">
                <DetailField label="Company" value={props.item.company} />
                <DetailField label="Product type" value={props.item.product_type} />
                <DetailField label="Recall number" value={props.item.recall_number} />
                <DetailField label="Event ID" value={props.item.event_id} />
              </dl>

              {props.item.distribution ? (
                <section className="mt-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/25 p-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Distribution
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[hsl(var(--muted-foreground))]">
                    {props.item.distribution}
                  </p>
                </section>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[hsl(var(--border))] pt-4">
                <SaveRecallButton
                  recallId={props.item.id}
                  initialSaved={props.initialSaved}
                  initialSavedItemId={props.initialSavedItemId}
                  userId={props.userId}
                />

                <ContentReactionBar
                  contentType="recall"
                  sourceItemId={props.item.id}
                  initialSummary={props.initialReactionSummary}
                  userId={props.userId}
                />
                
                <ContentShareButton
                  title={props.item.title}
                  text={props.item.reason ?? undefined}
                  shareUrl={CLIENT_PATHS.recallDetailPath(props.item.id)}
                />
              </div>

              <p className="mt-5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                Source: OpenFDA
              </p>
            </>
          )}
        </article>
      </main>
    </div>
  );
}