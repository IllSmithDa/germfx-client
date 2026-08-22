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

export default async function NewsDetailPage({
  params,
}: NewsDetailPageProps) {
  const { id } = await params;

  const [article, user] = await Promise.all([
    fetchNewsDetail(id),
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
      initialSaved={
        isLoggedIn ? Boolean(savedStatus?.saved) : undefined
      }
      initialSavedItemId={savedStatus?.saved_item_id ?? null}
      userId={user?.id}
    />
  );
}