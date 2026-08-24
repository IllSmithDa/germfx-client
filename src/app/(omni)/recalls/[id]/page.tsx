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
import { fetchRecallDetail } from "@/lib/server/contentDetailApi";

type RecallDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://germfx.com"
).replace(/\/$/, "");

const getRecallDetail = cache((id: string) => fetchRecallDetail(id));

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
}: RecallDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const recall = await getRecallDetail(id);

  if (!recall) {
    return {
      title: "Recall not found | GermFx",
      description:
        "The requested recall is no longer available in the GermFx database.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = `${SITE_URL}/recalls/${encodeURIComponent(
    String(recall.id),
  )}`;

  const description = buildMetadataDescription(
    recall.reason,
    `View recall details for ${recall.title} on GermFx.`,
  );

  return {
    title: recall.title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "article",
      siteName: "GermFx",
      locale: "en_US",
      title: recall.title,
      description,
      url: canonicalUrl,
      section: "Recalls",
    },

    twitter: {
      card: "summary",
      title: recall.title,
      description,
    },

    other: {
      "article:source": "OpenFDA",
    },
  };
}

export default async function RecallDetailPage({
  params,
}: RecallDetailPageProps) {
  const { id } = await params;

  const [recall, user] = await Promise.all([
    getRecallDetail(id),
    getCurrentUser(),
  ]);

  if (!recall) {
    notFound();
  }

  const isLoggedIn = Boolean(user?.id);

  const savedMapPromise: Promise<SavedCheckMap> = isLoggedIn
    ? fetchBulkSavedChecks("recall", [recall.id])
    : Promise.resolve({});

  const [reactionMap, savedMap] = await Promise.all([
    fetchBulkReactionSummaries("recall", [recall.id]),
    savedMapPromise,
  ]);

  const savedStatus = savedMap[recall.id];

  return (
    <ContentDetailPage
      contentType="recall"
      item={recall}
      initialReactionSummary={reactionMap[recall.id]}
      initialSaved={isLoggedIn ? Boolean(savedStatus?.saved) : undefined}
      initialSavedItemId={savedStatus?.saved_item_id ?? null}
      userId={user?.id}
    />
  );
}