import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import ContentDetailPage from "@/components/ContentDetailPage/ContentDetailPage";
import { getCurrentUser } from "@/lib/helpers/getCurrentUser";
import {
  fetchBulkReactionSummaries,
  fetchBulkSavedChecks,
  type SavedCheckMap,
} from "@/lib/server/bulkContentApi";
import { fetchNewsDetail } from "@/lib/server/contentDetailApi";

type NewsDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type NewsDetailWithDescription = NonNullable<
  Awaited<ReturnType<typeof fetchNewsDetail>>
> & {
  description?: string | null;
};

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://germfx.com"
).replace(/\/$/, "");

const getNewsDetail = cache((id: string) => fetchNewsDetail(id));

function buildMetadataDescription(
  value: string | null | undefined,
  fallback: string,
) {
  const normalized = value?.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  if (normalized.length <= 220) {
    return normalized;
  }

  return `${normalized.slice(0, 217).trimEnd()}...`;
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const article = (await getNewsDetail(id)) as NewsDetailWithDescription | null;

  if (!article) {
    return {
      title: "News article not found | GermFx",
      description:
        "The requested health news article is no longer available on GermFx.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = `${SITE_URL}/news/${encodeURIComponent(
    String(article.id),
  )}`;

  const description = buildMetadataDescription(
    article.summary ?? article.description,
    "Read this health news story on GermFx.",
  );

  const openGraphImages = article.image_url
    ? [
        {
          url: article.image_url,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ]
    : undefined;

  return {
    title: article.title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "article",
      siteName: "GermFx",
      locale: "en_US",
      title: article.title,
      description,
      url: canonicalUrl,
      publishedTime: article.published_at ?? undefined,
      section: "Health News",
      images: openGraphImages,
    },

    twitter: {
      card: article.image_url ? "summary_large_image" : "summary",
      title: article.title,
      description,
      images: article.image_url
        ? [
            {
              url: article.image_url,
              alt: article.title,
            },
          ]
        : undefined,
    },

    other: {
      "article:source": article.source ?? "GermFx",
    },
  };
}

export default async function NewsDetailPage({
  params,
}: NewsDetailPageProps) {
  const { id } = await params;

  const [article, user] = await Promise.all([
    getNewsDetail(id),
    getCurrentUser(),
  ]);

  if (!article) {
    notFound();
  }

  const isLoggedIn = Boolean(user?.id);

  const savedMapPromise: Promise<SavedCheckMap> = isLoggedIn
    ? fetchBulkSavedChecks("news", [article.id])
    : Promise.resolve({});

  const [reactionMap, savedMap] = await Promise.all([
    fetchBulkReactionSummaries("news", [article.id]),
    savedMapPromise,
  ]);

  const savedStatus = savedMap[article.id];

  return (
    <ContentDetailPage
      contentType="news"
      item={article}
      initialReactionSummary={reactionMap[article.id]}
      initialSaved={isLoggedIn ? Boolean(savedStatus?.saved) : undefined}
      initialSavedItemId={savedStatus?.saved_item_id ?? null}
      userId={user?.id}
    />
  );
}