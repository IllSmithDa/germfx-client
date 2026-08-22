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

export default async function RecallDetailPage({
  params,
}: RecallDetailPageProps) {
  const { id } = await params;

  const [recall, user] = await Promise.all([
    fetchRecallDetail(id),
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
      initialSaved={
        isLoggedIn ? Boolean(savedStatus?.saved) : undefined
      }
      initialSavedItemId={savedStatus?.saved_item_id ?? null}
      userId={user?.id}
    />
  );
}